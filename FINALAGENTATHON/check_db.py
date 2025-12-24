import sqlite3
import os
import json
from datetime import datetime

MANAGED_DB = "managed_storage.db"
CONTEXT_DB = "orchestrator_context.db"

def inspect_managed_storage():
    print(f"\n--- INSPECTING {MANAGED_DB} ---")
    if not os.path.exists(MANAGED_DB):
        print("❌ Database file not found.")
        return

    conn = sqlite3.connect(MANAGED_DB)
    cursor = conn.cursor()
    
    # Check Tables
    try:
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cursor.fetchall()]
        print(f"Tables found: {tables}")
        
        if "managed_storage" in tables:
            cursor.execute("SELECT count(*) FROM managed_storage")
            count = cursor.fetchone()[0]
            print(f"Total rows in managed_storage: {count}")
            
            # Sample Data
            if count > 0:
                print("\nLast 5 Entries:")
                cursor.execute("""
                    SELECT entity, agent_type, storage_type, confidence_score, created_at, data 
                    FROM managed_storage 
                    ORDER BY created_at DESC LIMIT 5
                """)
                for row in cursor.fetchall():
                    print(f"[{row[4]}] {row[0]} | {row[1]} ({row[2]}) | Conf: {row[3]}")
                    try:
                        data = json.loads(row[5])
                        keys = list(data.keys())
                        print(f"   Keys: {keys}")
                    except:
                        print("   (Invalid JSON data)")
    except Exception as e:
        print(f"Error inspecting managed storage: {e}")
    finally:
        conn.close()

def inspect_context_storage():
    print(f"\n--- INSPECTING {CONTEXT_DB} ---")
    if not os.path.exists(CONTEXT_DB):
        print("❌ Database file not found.")
        return

    conn = sqlite3.connect(CONTEXT_DB)
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cursor.fetchall()]
        print(f"Tables found: {tables}")
        
        # Check Cached Facts
        if "cached_facts" in tables:
            cursor.execute("SELECT count(*) FROM cached_facts")
            count = cursor.fetchone()[0]
            print(f"Cached Facts: {count}")
            
        # Check Recent Outputs
        if "recent_outputs" in tables:
            cursor.execute("SELECT count(*) FROM recent_outputs")
            count = cursor.fetchone()[0]
            print(f"Recent Outputs: {count}")
            
    except Exception as e:
        print(f"Error inspecting context storage: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    print("Database Truth Check Tool")
    inspect_managed_storage()
    inspect_context_storage()
