"""
Context Builder Module
Aggregates cached facts, historical signals, and recent outputs
"""
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from .storage import ContextStorage
import json

class ContextBuilder:
    """Builds enriched context from multiple data sources"""
    
    def __init__(self, storage: ContextStorage):
        self.storage = storage
    
    def build_context(self, entity: str, include_facts: bool = True,
                     include_signals: bool = True, include_outputs: bool = True,
                     signal_hours_back: int = 168) -> Dict[str, Any]:
        """
        Build comprehensive context for an entity
        
        Args:
            entity: Company/entity name
            include_facts: Include cached facts
            include_signals: Include historical signals
            include_outputs: Include recent outputs
            signal_hours_back: How many hours back to look for signals (default: 7 days)
        
        Returns:
            Dictionary with aggregated context
        """
        context = {
            "entity": entity,
            "built_at": datetime.now().isoformat(),
            "cached_facts": [],
            "historical_signals": [],
            "recent_outputs": []
        }
        
        # 1. Cached Facts
        if include_facts:
            facts = self.storage.get_all_facts(entity)
            context["cached_facts"] = facts
            context["facts_count"] = len(facts)
        
        # 2. Historical Signals
        if include_signals:
            signals = self.storage.get_signals(entity, hours_back=signal_hours_back)
            context["historical_signals"] = signals
            context["signals_count"] = len(signals)
            
            # Aggregate signal statistics
            if signals:
                context["signal_summary"] = self._summarize_signals(signals)
        
        # 3. Recent Outputs
        if include_outputs:
            outputs = self.storage.get_recent_outputs(entity, limit=20)
            context["recent_outputs"] = outputs
            context["outputs_count"] = len(outputs)
            
            # Group outputs by agent
            agent_outputs = {}
            for output in outputs:
                agent = output["agent_name"]
                if agent not in agent_outputs:
                    agent_outputs[agent] = []
                agent_outputs[agent].append(output)
            context["outputs_by_agent"] = agent_outputs
        
        return context
    
    def _summarize_signals(self, signals: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Summarize historical signals"""
        summary = {}
        
        # Group by signal type
        by_type = {}
        for signal in signals:
            sig_type = signal["signal_type"]
            if sig_type not in by_type:
                by_type[sig_type] = []
            by_type[sig_type].append(signal)
        
        # Calculate statistics per type
        for sig_type, sig_list in by_type.items():
            values = [s["signal_value"] for s in sig_list if s["signal_value"] is not None]
            if values:
                summary[sig_type] = {
                    "count": len(values),
                    "min": min(values),
                    "max": max(values),
                    "avg": sum(values) / len(values),
                    "latest": values[0] if values else None
                }
            else:
                summary[sig_type] = {
                    "count": len(sig_list),
                    "latest_timestamp": sig_list[0]["timestamp"] if sig_list else None
                }
        
        return summary
    
    def enrich_with_context(self, entity: str, agent_output: Dict[str, Any],
                           agent_name: str, store_output: bool = True) -> Dict[str, Any]:
        """
        Enrich agent output with context and store it
        
        Args:
            entity: Company/entity name
            agent_output: Output from an agent
            agent_name: Name of the agent that produced the output
            store_output: Whether to store this output in recent_outputs
        
        Returns:
            Enriched output with context
        """
        context = self.build_context(entity)
        
        enriched = {
            "entity": entity,
            "agent_name": agent_name,
            "timestamp": datetime.now().isoformat(),
            "agent_output": agent_output,
            "context": {
                "cached_facts_count": context.get("facts_count", 0),
                "historical_signals_count": context.get("signals_count", 0),
                "recent_outputs_count": context.get("outputs_count", 0),
                "signal_summary": context.get("signal_summary", {})
            }
        }
        
        # Store output if requested
        if store_output:
            request_id = f"{entity}_{agent_name}_{datetime.now().timestamp()}"
            self.storage.store_output(
                request_id=request_id,
                entity=entity,
                agent_name=agent_name,
                output_data=agent_output
            )
        
        return enriched
    
    def extract_and_store_facts(self, entity: str, agent_output: Dict[str, Any],
                                agent_name: str, confidence_threshold: float = 0.5):
        """
        Extract facts from agent output and store them
        
        Args:
            entity: Company/entity name
            agent_output: Output from an agent
            agent_name: Name of the agent
            confidence_threshold: Minimum confidence to store fact
        """
        # Extract facts based on agent type
        if agent_name == "company_profile" or "profile" in agent_name.lower():
            if "confidence_score" in agent_output:
                conf = agent_output.get("confidence_score", 0.0)
                if conf >= confidence_threshold:
                    self.storage.store_fact(
                        entity=entity,
                        fact_type="company_profile",
                        fact_data=agent_output,
                        confidence_score=conf,
                        source=agent_name,
                        expires_in_hours=720  # 30 days
                    )
        
        elif agent_name == "financial_analysis" or "financial" in agent_name.lower():
            if "confidence_score" in agent_output:
                conf = agent_output.get("confidence_score", 0.0)
                if conf >= confidence_threshold:
                    self.storage.store_fact(
                        entity=entity,
                        fact_type="financial_data",
                        fact_data=agent_output,
                        confidence_score=conf,
                        source=agent_name,
                        expires_in_hours=168  # 7 days (financial data changes frequently)
                    )
        
        elif agent_name == "price_changes" or "price" in agent_name.lower():
            # Store as signal (time-series)
            if "change_percentage" in agent_output:
                self.storage.store_signal(
                    entity=entity,
                    signal_type="price_change",
                    signal_value=agent_output.get("change_percentage"),
                    signal_data=agent_output,
                    metadata={"agent": agent_name}
                )
        
        elif agent_name == "product_launches" or "launch" in agent_name.lower():
            if "confidence_score" in agent_output:
                conf = agent_output.get("confidence_score", 0.0)
                if conf >= confidence_threshold:
                    self.storage.store_fact(
                        entity=entity,
                        fact_type="product_launch",
                        fact_data=agent_output,
                        confidence_score=conf,
                        source=agent_name,
                        expires_in_hours=720  # 30 days
                    )

