#!/usr/bin/env python3
"""
Taste of Village - Production API Health & Monitoring Probe
Usage:
  python3 scripts/health-probe.py [--url URL]

Default target: https://www.tasteofvillagerestaurants.co.uk/api/health
Exits with 0 if healthy, 1 if degraded or unreachable.
"""

import sys
import json
import argparse
import urllib.request
import urllib.error

def check_health(target_url: str):
    if not target_url.endswith("/api/health"):
        target_url = target_url.rstrip("/") + "/api/health"
    print(f"[*] Pinging health endpoint: {target_url}")
    req = urllib.request.Request(
        target_url,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 TOV-HealthProbe/1.0"}
    )
    
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            status_code = resp.status
            body = resp.read().decode("utf-8")
            data = json.loads(body)
            
            print(f"[+] HTTP Status: {status_code}")
            print(f"[+] Overall Health: {data.get('status', 'unknown').upper()}")
            print(f"[+] Roundtrip Time: {data.get('durationMs', 'N/A')}ms")
            
            checks = data.get("checks", {})
            fs = checks.get("firestore", {})
            sq = checks.get("square", {})
            ops = checks.get("operations", {})
            
            print(f"    - Firestore: {fs.get('status')} ({fs.get('latencyMs', 'N/A')}ms)")
            print(f"    - Square: {sq.get('status')} (Token: {sq.get('accessTokenConfigured')})")
            print(f"    - Kitchen: {ops.get('kitchenStatus')} (Current UK: {ops.get('currentTimeUK')})")
            
            if data.get("status") == "healthy":
                print("[OK] All systems operational.")
                return 0
            else:
                print(f"[WARN] Degraded system status: {data.get('status')}")
                return 1

    except urllib.error.HTTPError as e:
        print(f"[FAIL] HTTP Error {e.code}: {e.reason}", file=sys.stderr)
        try:
            err_body = e.read().decode("utf-8")
            print(f"Response: {err_body}", file=sys.stderr)
        except Exception:
            pass
        return 1
    except Exception as e:
        print(f"[FAIL] Connection error: {e}", file=sys.stderr)
        return 1

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="TOV Health Probe")
    parser.add_argument(
        "--url",
        default="https://www.tasteofvillagerestaurants.co.uk/api/health",
        help="Health check endpoint URL"
    )
    args = parser.parse_args()
    sys.exit(check_health(args.url))
