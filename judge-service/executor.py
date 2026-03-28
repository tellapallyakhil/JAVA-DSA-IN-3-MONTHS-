import subprocess
import os
import tempfile
import time
import re

# Security: Block dangerous patterns
BLOCKED_PATTERNS = [
    r'Runtime\.getRuntime\(\)',
    r'ProcessBuilder',
    r'System\.exit',
    r'java\.io\.File',
    r'java\.net\.',
    r'java\.lang\.reflect',
    r'ClassLoader',
    r'Thread\.sleep\(\s*\d{5,}',  # sleep > 10s
    r'exec\s*\(',
]

def is_code_safe(code: str) -> tuple[bool, str]:
    """Check code for dangerous patterns."""
    for pattern in BLOCKED_PATTERNS:
        if re.search(pattern, code):
            return False, f"Blocked: code contains restricted pattern ({pattern})"
    return True, ""


def execute_java(code: str, stdin: str = ""):
    # 1. Security check
    safe, reason = is_code_safe(code)
    if not safe:
        return {
            "success": False,
            "error": reason,
            "type": "Security Error"
        }

    # 2. Create isolated temp directory (auto-cleaned)
    with tempfile.TemporaryDirectory(prefix="judge_") as work_dir:
        file_path = os.path.join(work_dir, "Main.java")
        
        try:
            # Write code to file
            with open(file_path, "w") as f:
                f.write(code)
            
            # 3. Compile with resource limits
            compile_process = subprocess.run(
                ["javac", "-J-Xmx256m", "Main.java"],
                cwd=work_dir,
                capture_output=True,
                text=True,
                timeout=15  # 15s compile limit
            )
            
            if compile_process.returncode != 0:
                error_msg = compile_process.stderr
                # Clean up file paths from error messages
                error_msg = error_msg.replace(work_dir + os.sep, "")
                return {
                    "success": False,
                    "error": error_msg,
                    "type": "Compilation Error"
                }
            
            # 4. Execute with strict resource limits
            start_time = time.time()
            run_process = subprocess.run(
                [
                    "java",
                    "-Xmx128m",             # Max heap 128MB
                    "-Xms32m",               # Initial heap 32MB
                    "-XX:MaxMetaspaceSize=64m",
                    "-Djava.security.manager=allow",
                    "Main"
                ],
                cwd=work_dir,
                input=stdin,
                capture_output=True,
                text=True,
                timeout=10  # 10s execution limit
            )
            end_time = time.time()
            runtime_ms = round((end_time - start_time) * 1000, 2)
            
            output = run_process.stdout
            error = run_process.stderr
            
            # Truncate extremely long outputs (max 100KB)
            if len(output) > 100_000:
                output = output[:100_000] + "\n\n--- Output truncated (exceeded 100KB) ---"
            
            if run_process.returncode == 0:
                return {
                    "success": True,
                    "output": output,
                    "error": error,
                    "runtime": runtime_ms,
                    "type": "Success"
                }
            else:
                # Clean up file paths from error messages
                error = error.replace(work_dir + os.sep, "")
                return {
                    "success": False,
                    "output": output,
                    "error": error or "Non-zero exit code",
                    "runtime": runtime_ms,
                    "type": "Runtime Error"
                }

        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "error": "Time Limit Exceeded — your program took too long (max 10s).",
                "type": "Time Limit Exceeded"
            }
        except MemoryError:
            return {
                "success": False,
                "error": "Memory Limit Exceeded.",
                "type": "Memory Limit Exceeded"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "type": "System Error"
            }
