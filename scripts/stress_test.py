import requests
import time
import concurrent.futures
from datetime import datetime

# Configuration
API_URL = "http://localhost:8080/api/v1/doctors"  # Hitting doctor-service via Gateway
TOTAL_REQUESTS = 1000
CONCURRENT_THREADS = 10

def make_request(request_id):
    try:
        start_time = time.time()
        response = requests.get(API_URL)
        end_time = time.time()
        
        status = response.status_code
        is_cached = response.headers.get("X-Cache", "UNKNOWN")
        duration = (end_time - start_time) * 1000 # convert to ms
        
        return {
            "id": request_id,
            "status": status,
            "duration": duration,
            "cached": is_cached
        }
    except Exception as e:
        return {"id": request_id, "status": "ERROR", "error": str(e)}

def run_stress_test():
    print(f"🚀 Starting Stress Test: {TOTAL_REQUESTS} requests to {API_URL}")
    print(f"🧵 Concurrency level: {CONCURRENT_THREADS} threads")
    print("-" * 50)
    
    start_all = time.time()
    results = []
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=CONCURRENT_THREADS) as executor:
        futures = [executor.submit(make_request, i) for i in range(TOTAL_REQUESTS)]
        for future in concurrent.futures.as_completed(futures):
            results.append(future.result())
    
    end_all = time.time()
    total_duration = end_all - start_all
    
    # Analyze results
    success_count = sum(1 for r in results if r.get("status") == 200)
    total_ms = float(sum(r.get("duration", 0.0) for r in results if "duration" in r))
    avg_ms = total_ms / len(results) if results else 0.0
    cache_hits = sum(1 for r in results if r.get("cached") == "HIT")
    
    print("-" * 50)
    print(f"📊 Summary Results:")
    print(f"✅ Successful Requests: {success_count}/{TOTAL_REQUESTS}")
    print(f"⚡ Total Time Taken: {total_duration:.2f} seconds")
    print(f"⏱️  Average Request Latency: {avg_ms:.2f} ms")
    print(f"🚀 Requests Per Second (RPS): {TOTAL_REQUESTS / total_duration:.2f}")
    print(f"💾 Redis Cache Hits: {cache_hits}")
    print("-" * 50)
    
    if success_count == TOTAL_REQUESTS:
        print("🏆 Test Passed! The C++ backend handled the load flawlessly.")
    else:
        print("⚠️ Test finished with some errors. Ensure microservices are running.")

if __name__ == "__main__":
    run_stress_test()
