import subprocess
import os
import uuid
import time

def execute_java(code: str, stdin: str = ""):
    # 1. Create a unique directory for this execution
    request_id = str(uuid.uuid4())[:8]
    work_dir = f"temp_{request_id}"
    os.makedirs(work_dir, exist_ok=True)
    
    # 2. Extract Class Name (Simple regex for Main)
    # Most platforms assume public class Main
    file_path = os.path.join(work_dir, "Main.java")
    
    try:
        # Write code to file
        with open(file_path, "w") as f:
            f.write(code)
        
        # 3. Compile
        compile_process = subprocess.run(
            ["javac", "Main.java"],
            cwd=work_dir,
            capture_output=True,
            text=True,
            timeout=10 # 10s compile limit
        )
        
        if compile_process.returncode != 0:
            return {
                "success": False,
                "error": compile_process.stderr,
                "type": "Compilation Error"
            }
        
        # 4. Execute
        start_time = time.time()
        run_process = subprocess.run(
            ["java", "Main"],
            cwd=work_dir,
            input=stdin,
            capture_output=True,
            text=True,
            timeout=5 # 5s execution limit (standard for competitive programming)
        )
        end_time = time.time()
        
        return {
            "success": True,
            "output": run_process.stdout,
            "error": run_process.stderr,
            "runtime": round((end_time - start_time) * 1000, 2), # ms
            "type": "Success" if run_process.returncode == 0 else "Runtime Error"
        }

    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "error": "Time Limit Exceeded (TLE)",
            "type": "Timeout"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "type": "System Error"
        }
    finally:
        # Cleanup
        try:
            for f in os.listdir(work_dir):
                os.remove(os.path.join(work_dir, f))
            os.rmdir(work_dir)
        except:
            pass
