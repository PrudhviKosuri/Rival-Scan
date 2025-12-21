"""
Storage layer for Context Builder
Manages cached facts, historical signals, and recent outputs
"""
import json
import sqlite3
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from pathlib import Path
import os

class ContextStorage:
    """Storage backend for context data"""
    
    def __init__(self, db_path: str = "orchestrator_context.db"):
        self.db_path = db_path
        self._init_db()
    
    def _init_db(self):
        """Initialize SQLite database with required tables"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Cached facts table (long-term storage)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS cached_facts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                entity TEXT NOT NULL,
                fact_type TEXT NOT NULL,
                fact_data TEXT NOT NULL,
                confidence_score REAL DEFAULT 0.0,
                source TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP,
                UNIQUE(entity, fact_type)
            )
        """)
        
        # Historical signals table (time-series data)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS historical_signals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                entity TEXT NOT NULL,
                signal_type TEXT NOT NULL,
                signal_value REAL,
                signal_data TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                metadata TEXT
            )
        """)
        
        # Recent outputs table (short-term cache)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS recent_outputs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                request_id TEXT,
                entity TEXT NOT NULL,
                agent_name TEXT NOT NULL,
                output_data TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ttl_seconds INTEGER DEFAULT 3600
            )
        """)
        
        # Create indexes for performance
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_entity_fact ON cached_facts(entity, fact_type)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_entity_signal ON historical_signals(entity, signal_type, timestamp)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_entity_output ON recent_outputs(entity, timestamp)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_request_output ON recent_outputs(request_id)")
        
        conn.commit()
        conn.close()
    
    # --- CACHED FACTS METHODS ---
    def store_fact(self, entity: str, fact_type: str, fact_data: Dict[str, Any], 
                   confidence_score: float = 0.0, source: str = None, 
                   expires_in_hours: Optional[int] = None):
        """Store or update a cached fact"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        expires_at = None
        if expires_in_hours:
            expires_at = (datetime.now() + timedelta(hours=expires_in_hours)).isoformat()
        
        cursor.execute("""
            INSERT OR REPLACE INTO cached_facts 
            (entity, fact_type, fact_data, confidence_score, source, updated_at, expires_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            entity, fact_type, json.dumps(fact_data), confidence_score, 
            source, datetime.now().isoformat(), expires_at
        ))
        
        conn.commit()
        conn.close()
    
    def get_fact(self, entity: str, fact_type: str) -> Optional[Dict[str, Any]]:
        """Retrieve a cached fact if not expired"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT fact_data, confidence_score, source, expires_at
            FROM cached_facts
            WHERE entity = ? AND fact_type = ?
            AND (expires_at IS NULL OR expires_at > ?)
        """, (entity, fact_type, datetime.now().isoformat()))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return {
                "data": json.loads(row[0]),
                "confidence_score": row[1],
                "source": row[2],
                "expires_at": row[3]
            }
        return None
    
    def get_all_facts(self, entity: str) -> List[Dict[str, Any]]:
        """Get all non-expired facts for an entity"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT fact_type, fact_data, confidence_score, source
            FROM cached_facts
            WHERE entity = ? AND (expires_at IS NULL OR expires_at > ?)
            ORDER BY updated_at DESC
        """, (entity, datetime.now().isoformat()))
        
        facts = []
        for row in cursor.fetchall():
            facts.append({
                "fact_type": row[0],
                "data": json.loads(row[1]),
                "confidence_score": row[2],
                "source": row[3]
            })
        
        conn.close()
        return facts
    
    # --- HISTORICAL SIGNALS METHODS ---
    def store_signal(self, entity: str, signal_type: str, signal_value: Optional[float] = None,
                    signal_data: Optional[Dict[str, Any]] = None, metadata: Optional[Dict[str, Any]] = None):
        """Store a historical signal"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO historical_signals 
            (entity, signal_type, signal_value, signal_data, metadata)
            VALUES (?, ?, ?, ?, ?)
        """, (
            entity, signal_type, signal_value,
            json.dumps(signal_data) if signal_data else None,
            json.dumps(metadata) if metadata else None
        ))
        
        conn.commit()
        conn.close()
    
    def get_signals(self, entity: str, signal_type: Optional[str] = None,
                   hours_back: int = 168) -> List[Dict[str, Any]]:
        """Get historical signals for an entity (default: last 7 days)"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cutoff_time = (datetime.now() - timedelta(hours=hours_back)).isoformat()
        
        if signal_type:
            cursor.execute("""
                SELECT signal_type, signal_value, signal_data, timestamp, metadata
                FROM historical_signals
                WHERE entity = ? AND signal_type = ? AND timestamp > ?
                ORDER BY timestamp DESC
            """, (entity, signal_type, cutoff_time))
        else:
            cursor.execute("""
                SELECT signal_type, signal_value, signal_data, timestamp, metadata
                FROM historical_signals
                WHERE entity = ? AND timestamp > ?
                ORDER BY timestamp DESC
            """, (entity, cutoff_time))
        
        signals = []
        for row in cursor.fetchall():
            signals.append({
                "signal_type": row[0],
                "signal_value": row[1],
                "signal_data": json.loads(row[2]) if row[2] else None,
                "timestamp": row[3],
                "metadata": json.loads(row[4]) if row[4] else None
            })
        
        conn.close()
        return signals
    
    # --- RECENT OUTPUTS METHODS ---
    def store_output(self, request_id: str, entity: str, agent_name: str,
                    output_data: Dict[str, Any], ttl_seconds: int = 3600):
        """Store a recent output with TTL"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO recent_outputs 
            (request_id, entity, agent_name, output_data, ttl_seconds)
            VALUES (?, ?, ?, ?, ?)
        """, (
            request_id, entity, agent_name, json.dumps(output_data), ttl_seconds
        ))
        
        conn.commit()
        conn.close()
    
    def get_recent_outputs(self, entity: str, agent_name: Optional[str] = None,
                          limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent outputs for an entity"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Clean expired outputs
        cursor.execute("""
            DELETE FROM recent_outputs
            WHERE (julianday('now') - julianday(timestamp)) * 86400 > ttl_seconds
        """)
        
        if agent_name:
            cursor.execute("""
                SELECT request_id, agent_name, output_data, timestamp
                FROM recent_outputs
                WHERE entity = ? AND agent_name = ?
                ORDER BY timestamp DESC
                LIMIT ?
            """, (entity, agent_name, limit))
        else:
            cursor.execute("""
                SELECT request_id, agent_name, output_data, timestamp
                FROM recent_outputs
                WHERE entity = ?
                ORDER BY timestamp DESC
                LIMIT ?
            """, (entity, limit))
        
        outputs = []
        for row in cursor.fetchall():
            outputs.append({
                "request_id": row[0],
                "agent_name": row[1],
                "output_data": json.loads(row[2]),
                "timestamp": row[3]
            })
        
        conn.commit()
        conn.close()
        return outputs
    
    def cleanup_expired(self):
        """Clean up expired facts and outputs"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Clean expired facts
        cursor.execute("""
            DELETE FROM cached_facts
            WHERE expires_at IS NOT NULL AND expires_at < ?
        """, (datetime.now().isoformat(),))
        
        # Clean expired outputs
        cursor.execute("""
            DELETE FROM recent_outputs
            WHERE (julianday('now') - julianday(timestamp)) * 86400 > ttl_seconds
        """)
        
        conn.commit()
        conn.close()

