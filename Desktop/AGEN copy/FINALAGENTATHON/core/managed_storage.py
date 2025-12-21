"""
Managed Storage + Retrieval System
Provides structured storage and retrieval for agent outputs
"""
import os
import json
import hashlib
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from pathlib import Path
import sqlite3
from dataclasses import dataclass, asdict
from enum import Enum

class StorageType(str, Enum):
    """Types of storage"""
    FACT = "fact"
    SIGNAL = "signal"
    OUTPUT = "output"
    SCHEMA = "schema"

@dataclass
class StorageMetadata:
    """Metadata for stored items"""
    entity: str
    agent_type: str
    storage_type: StorageType
    schema_version: str
    confidence_score: float
    created_at: str
    updated_at: str
    expires_at: Optional[str] = None
    tags: List[str] = None
    source: Optional[str] = None
    
    def __post_init__(self):
        if self.tags is None:
            self.tags = []

class ManagedStorage:
    """
    Managed storage system with indexing, retrieval, and validation
    """
    
    def __init__(self, db_path: str = "managed_storage.db"):
        self.db_path = db_path
        self._init_database()
    
    def _init_database(self):
        """Initialize database with managed storage tables"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Main storage table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS managed_storage (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                storage_key TEXT UNIQUE NOT NULL,
                entity TEXT NOT NULL,
                agent_type TEXT NOT NULL,
                storage_type TEXT NOT NULL,
                data TEXT NOT NULL,
                schema_version TEXT,
                confidence_score REAL DEFAULT 0.0,
                metadata TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP
            )
        """)
        
        # Create indexes for managed_storage
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_entity_type ON managed_storage(entity, agent_type)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_storage_type ON managed_storage(storage_type)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_created ON managed_storage(created_at)")
        
        # Index table for fast lookups
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS storage_index (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                storage_key TEXT NOT NULL,
                index_key TEXT NOT NULL,
                index_value TEXT,
                FOREIGN KEY (storage_key) REFERENCES managed_storage(storage_key)
            )
        """)

        # Create index for storage_index
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_lookup ON storage_index(index_key, index_value)")
        
        # Schema registry
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS schema_registry (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                schema_name TEXT UNIQUE NOT NULL,
                schema_version TEXT NOT NULL,
                schema_definition TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Analysis Jobs table for frontend integration
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS analysis_jobs (
                id TEXT PRIMARY KEY,
                entity TEXT NOT NULL,
                status TEXT NOT NULL,
                result JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        conn.commit()
        conn.close()
    
    def _generate_storage_key(self, entity: str, agent_type: str, data_hash: str) -> str:
        """Generate unique storage key"""
        key_string = f"{entity}:{agent_type}:{data_hash}"
        return hashlib.sha256(key_string.encode()).hexdigest()[:16]
    
    def _hash_data(self, data: Dict[str, Any]) -> str:
        """Generate hash for data"""
        data_str = json.dumps(data, sort_keys=True)
        return hashlib.md5(data_str.encode()).hexdigest()
    
    def store(
        self,
        entity: str,
        agent_type: str,
        data: Dict[str, Any],
        storage_type: StorageType = StorageType.OUTPUT,
        schema_version: Optional[str] = None,
        confidence_score: float = 0.0,
        expires_in_hours: Optional[int] = None,
        tags: Optional[List[str]] = None,
        source: Optional[str] = None,
        index_fields: Optional[List[str]] = None
    ) -> str:
        """
        Store structured data with metadata
        
        Args:
            entity: Entity name
            agent_type: Type of agent that generated the data
            data: Data to store
            storage_type: Type of storage
            schema_version: Schema version
            confidence_score: Confidence score
            expires_in_hours: Expiration time in hours
            tags: Optional tags
            source: Optional source identifier
            index_fields: Fields to index for fast retrieval
        
        Returns:
            Storage key
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Generate storage key
        data_hash = self._hash_data(data)
        storage_key = self._generate_storage_key(entity, agent_type, data_hash)
        
        # Prepare metadata
        expires_at = None
        if expires_in_hours:
            expires_at = (datetime.now() + timedelta(hours=expires_in_hours)).isoformat()
        
        metadata = StorageMetadata(
            entity=entity,
            agent_type=agent_type,
            storage_type=storage_type,
            schema_version=schema_version or "1.0",
            confidence_score=confidence_score,
            created_at=datetime.now().isoformat(),
            updated_at=datetime.now().isoformat(),
            expires_at=expires_at,
            tags=tags or [],
            source=source
        )
        
        # Store or update
        cursor.execute("""
            INSERT OR REPLACE INTO managed_storage
            (storage_key, entity, agent_type, storage_type, data, schema_version,
             confidence_score, metadata, updated_at, expires_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            storage_key, entity, agent_type, storage_type.value,
            json.dumps(data), schema_version or "1.0",
            confidence_score, json.dumps(asdict(metadata)),
            datetime.now().isoformat(), expires_at
        ))
        
        # Create indexes
        if index_fields:
            cursor.execute("DELETE FROM storage_index WHERE storage_key = ?", (storage_key,))
            for field in index_fields:
                if field in data:
                    index_value = str(data[field])
                    cursor.execute("""
                        INSERT INTO storage_index (storage_key, index_key, index_value)
                        VALUES (?, ?, ?)
                    """, (storage_key, field, index_value))
        
        conn.commit()
        conn.close()
        
        return storage_key
    
    def retrieve(
        self,
        entity: Optional[str] = None,
        agent_type: Optional[str] = None,
        storage_type: Optional[StorageType] = None,
        limit: int = 10,
        min_confidence: float = 0.0,
        include_expired: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Retrieve stored data with filters
        
        Args:
            entity: Filter by entity
            agent_type: Filter by agent type
            storage_type: Filter by storage type
            limit: Maximum results
            min_confidence: Minimum confidence score
            include_expired: Include expired items
        
        Returns:
            List of stored items with metadata
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        query = "SELECT storage_key, entity, agent_type, storage_type, data, metadata, created_at FROM managed_storage WHERE 1=1"
        params = []
        
        if entity:
            query += " AND entity = ?"
            params.append(entity)
        
        if agent_type:
            query += " AND agent_type = ?"
            params.append(agent_type)
        
        if storage_type:
            query += " AND storage_type = ?"
            params.append(storage_type.value)
        
        query += " AND confidence_score >= ?"
        params.append(min_confidence)
        
        if not include_expired:
            query += " AND (expires_at IS NULL OR expires_at > ?)"
            params.append(datetime.now().isoformat())
        
        query += " ORDER BY created_at DESC LIMIT ?"
        params.append(limit)
        
        cursor.execute(query, params)
        
        results = []
        for row in cursor.fetchall():
            storage_key, entity, agent_type, storage_type, data_str, metadata_str, created_at = row
            results.append({
                "storage_key": storage_key,
                "entity": entity,
                "agent_type": agent_type,
                "storage_type": storage_type,
                "data": json.loads(data_str),
                "metadata": json.loads(metadata_str),
                "created_at": created_at
            })
        
        conn.close()
        return results
    
    def retrieve_by_index(
        self,
        index_key: str,
        index_value: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Retrieve data by indexed field
        
        Args:
            index_key: Field name
            index_value: Field value
            limit: Maximum results
        
        Returns:
            List of stored items
        """
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT ms.storage_key, ms.entity, ms.agent_type, ms.storage_type,
                   ms.data, ms.metadata, ms.created_at
            FROM managed_storage ms
            JOIN storage_index si ON ms.storage_key = si.storage_key
            WHERE si.index_key = ? AND si.index_value = ?
            AND (ms.expires_at IS NULL OR ms.expires_at > ?)
            ORDER BY ms.created_at DESC
            LIMIT ?
        """, (index_key, index_value, datetime.now().isoformat(), limit))
        
        results = []
        for row in cursor.fetchall():
            storage_key, entity, agent_type, storage_type, data_str, metadata_str, created_at = row
            results.append({
                "storage_key": storage_key,
                "entity": entity,
                "agent_type": agent_type,
                "storage_type": storage_type,
                "data": json.loads(data_str),
                "metadata": json.loads(metadata_str),
                "created_at": created_at
            })
        
        conn.close()
        return results
    
    def get_latest(
        self,
        entity: str,
        agent_type: str,
        storage_type: Optional[StorageType] = None
    ) -> Optional[Dict[str, Any]]:
        """Get latest stored item for entity and agent type"""
        results = self.retrieve(
            entity=entity,
            agent_type=agent_type,
            storage_type=storage_type,
            limit=1
        )
        return results[0] if results else None
    
    def register_schema(
        self,
        schema_name: str,
        schema_version: str,
        schema_definition: Dict[str, Any]
    ):
        """Register a schema for validation"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT OR REPLACE INTO schema_registry
            (schema_name, schema_version, schema_definition)
            VALUES (?, ?, ?)
        """, (schema_name, schema_version, json.dumps(schema_definition)))
        
        conn.commit()
        conn.close()
    
    def get_schema(self, schema_name: str, schema_version: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Retrieve a registered schema"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if schema_version:
            cursor.execute("""
                SELECT schema_definition FROM schema_registry
                WHERE schema_name = ? AND schema_version = ?
            """, (schema_name, schema_version))
        else:
            cursor.execute("""
                SELECT schema_definition FROM schema_registry
                WHERE schema_name = ?
                ORDER BY created_at DESC LIMIT 1
            """, (schema_name,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return json.loads(row[0])
        return None
    
    def create_job(self, job_id: str, entity: str, status: str = "queued"):
        """Create a new analysis job"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO analysis_jobs (id, entity, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
        """, (job_id, entity, status, datetime.now().isoformat(), datetime.now().isoformat()))
        
        conn.commit()
        conn.close()

    def update_job(self, job_id: str, status: str, result: Optional[Dict[str, Any]] = None):
        """Update job status and result"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if result:
            cursor.execute("""
                UPDATE analysis_jobs 
                SET status = ?, result = ?, updated_at = ?
                WHERE id = ?
            """, (status, json.dumps(result), datetime.now().isoformat(), job_id))
        else:
            cursor.execute("""
                UPDATE analysis_jobs 
                SET status = ?, updated_at = ?
                WHERE id = ?
            """, (status, datetime.now().isoformat(), job_id))
            
        conn.commit()
        conn.close()

    def get_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Get job details"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT id, entity, status, result, created_at, updated_at FROM analysis_jobs WHERE id = ?", (job_id,))
        row = cursor.fetchone()
        
        conn.close()
        
        if row:
            return {
                "id": row[0],
                "entity": row[1],
                "status": row[2],
                "result": json.loads(row[3]) if row[3] else None,
                "created_at": row[4],
                "updated_at": row[5]
            }
        return None

    def cleanup_expired(self):
        """Remove expired items"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            DELETE FROM storage_index
            WHERE storage_key IN (
                SELECT storage_key FROM managed_storage
                WHERE expires_at IS NOT NULL AND expires_at < ?
            )
        """, (datetime.now().isoformat(),))
        
        cursor.execute("""
            DELETE FROM managed_storage
            WHERE expires_at IS NOT NULL AND expires_at < ?
        """, (datetime.now().isoformat(),))
        
        conn.commit()
        conn.close()

