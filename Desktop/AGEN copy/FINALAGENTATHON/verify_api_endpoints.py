import requests
import time
import sys

BASE_URL = "http://localhost:8000"

def test_frontend_flow(entity="Microsoft"):
    print(f"Testing Analysis Flow for {entity}...")
    
    # 1. Create Job
    print("[1] POST /api/analysis/create")
    try:
        resp = requests.post(f"{BASE_URL}/api/analysis/create", json={"domain": entity, "competitor": entity})
        resp.raise_for_status()
        data = resp.json()
        job_id = data["job_id"]
        print(f"   ✅ Job Created: {job_id} (Status: {data['status']})")
    except Exception as e:
        print(f"   ❌ Failed to create job: {e}")
        return

    # 2. Poll Status
    print(f"[2] Polling Status for Job {job_id}...")
    status = "queued"
    max_retries = 30
    while status in ["queued", "analyzing"] and max_retries > 0:
        time.sleep(2)
        try:
            resp = requests.get(f"{BASE_URL}/api/jobs/{job_id}/status")
            resp.raise_for_status()
            status_data = resp.json()
            status = status_data["status"]
            print(f"   Status: {status}...")
        except Exception as e:
            print(f"   ❌ Polling failed: {e}")
            break
        max_retries -= 1
    
    if status != "completed":
        print(f"   ❌ Job failed or timed out. Final Status: {status}")
        return
    else:
        print("   ✅ Job Completed!")

    # 3. Retrieve Sections
    sections = [
        "overview",
        "offerings",
        "market-signals",
        "sentiment",
        "executive-summary",
        "risks",
        "follow-ups"
    ]
    
    print("[3] Verifying Section Endpoints...")
    for section in sections:
        url = f"{BASE_URL}/api/analysis/{job_id}/{section}"
        try:
            resp = requests.get(url)
            if resp.status_code == 200:
                print(f"   ✅ GET .../{section}: OK ({len(resp.content)} bytes)")
                try:
                    payload = resp.json()
                except Exception:
                    print(f"       ❌ {section}: Response is not valid JSON")
                    continue
                if section == "offerings":
                    ok = isinstance(payload, dict) and "product_launches" in payload and "pricing_changes" in payload
                    if not ok:
                        print("       ❌ offerings: Missing required top-level keys")
                        continue
                    if isinstance(payload.get("product_launches"), list) and payload.get("product_launches"):
                        pl = payload["product_launches"][0]
                        required = ["product_name", "launch_date", "description", "key_features"]
                        missing = [k for k in required if k not in pl]
                        if missing:
                            print(f"       ❌ offerings.product_launches[0]: Missing keys {missing}")
                        else:
                            print("       ✅ offerings.product_launches keys OK")
                    else:
                        print("       ⚠️ offerings.product_launches: Empty or not a list")
                    if isinstance(payload.get("pricing_changes"), list) and payload.get("pricing_changes"):
                        pc = payload["pricing_changes"][0]
                        required = ["product_name", "old_price", "new_price", "direction", "description"]
                        missing = [k for k in required if k not in pc]
                        if missing:
                            print(f"       ❌ offerings.pricing_changes[0]: Missing keys {missing}")
                        else:
                            print("       ✅ offerings.pricing_changes keys OK")
                    else:
                        print("       ⚠️ offerings.pricing_changes: Empty or not a list")
                elif section == "market-signals":
                    fin = payload.get("financials") if isinstance(payload, dict) else None
                    required = ["revenue", "turnover", "growth_rate", "analysis_summary"]
                    if not isinstance(fin, dict):
                        print("       ❌ market-signals: 'financials' missing or not an object")
                    else:
                        missing = [k for k in required if k not in fin]
                        if missing:
                            print(f"       ❌ market-signals.financials: Missing keys {missing}")
                        else:
                            print("       ✅ market-signals.financials keys OK")
                elif section == "sentiment":
                    required = ["sentiment_summary", "sentiment_score", "risks", "opportunities"]
                    if not isinstance(payload, dict):
                        print("       ❌ sentiment: Response is not an object")
                    else:
                        missing = [k for k in required if k not in payload]
                        if missing:
                            print(f"       ❌ sentiment: Missing keys {missing}")
                        else:
                            print("       ✅ sentiment keys OK")
                elif section == "executive-summary":
                    required = ["summary", "key_highlights", "overall_outlook"]
                    if not isinstance(payload, dict):
                        print("       ❌ executive-summary: Response is not an object")
                    else:
                        missing = [k for k in required if k not in payload]
                        if missing:
                            print(f"       ❌ executive-summary: Missing keys {missing}")
                        else:
                            print("       ✅ executive-summary keys OK")
                elif section == "risks":
                    if not isinstance(payload, dict) or "risks" not in payload:
                        print("       ❌ risks: Missing 'risks'")
                    else:
                        print("       ✅ risks keys OK")
                elif section == "follow-ups":
                    if not isinstance(payload, dict) or "questions" not in payload:
                        print("       ❌ follow-ups: Missing 'questions'")
                    else:
                        print("       ✅ follow-ups keys OK")
            else:
                print(f"   ❌ GET .../{section}: Failed ({resp.status_code})")
        except Exception as e:
             print(f"   ❌ Request error for {section}: {e}")
    
    print("[4] Exporting PDF...")
    try:
        resp = requests.post(f"{BASE_URL}/api/analysis/{job_id}/export/pdf", json={"include_sections": sections})
        ct = resp.headers.get("Content-Type", "")
        if resp.status_code == 200 and "application/pdf" in ct and len(resp.content) > 800:
            print(f"   ✅ PDF Export: OK ({len(resp.content)} bytes)")
        else:
            print(f"   ❌ PDF Export failed ({resp.status_code}, Content-Type: {ct}, Size: {len(resp.content)} bytes)")
    except Exception as e:
        print(f"   ❌ PDF Export request error: {e}")

if __name__ == "__main__":
    test_frontend_flow()
