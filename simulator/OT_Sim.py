import shutil
import subprocess
import sys
import os
from pathlib import Path


def run_command(command, cwd=None):
    print(f"Running command: {' '.join(command)}")
    subprocess.check_call(command, cwd=cwd if cwd is None else str(cwd))


def on_rm_error(func, path, exc_info):
    """Error handler for `shutil.rmtree`."""
    import stat

    if not os.access(path, os.W_OK):
        # Change the file to be writable (stat.S_IWRITE)
        os.chmod(path, stat.S_IWRITE)
        # Retry the deletion
        func(path)
    else:
        raise

def main(commit_hash):
    repo_url = (
        "https://github.com/Opentrons/opentrons"  # Replace with your repository URL
    )
    repo_name = Path(repo_url.split("/")[-1])
    current_dir = Path.cwd()
    repo_path = current_dir / repo_name
    print(repo_path)

    if repo_path.exists() and repo_path.is_dir():
        print(f"Deleting repo directory '{repo_path}'...")
        shutil.rmtree(repo_path, onerror=on_rm_error)

    print("Cloning the repository...")
    run_command(["git", "clone", repo_url, "--depth", "1", "--branch", commit_hash])

    bin_dir = ""
    pip_path = "pip" if sys.platform == "win32" else "pip3"
    #pip_install_cmd = [str(pip_path), "-m", "pip", "install", "-U"]
    pip_install_cmd = [str(pip_path), "install", "-U"]


    print("Installing dependencies...")
    run_command(pip_install_cmd + [str(repo_path / "shared-data/python")])
    run_command(pip_install_cmd + [str(repo_path / "hardware[flex]")])
    run_command(pip_install_cmd + [str(repo_path / "api")])

    shutil.rmtree(repo_path, onerror=on_rm_error)

    print("Setup complete.")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python script.py <commit_hash>")
        sys.exit(1)

    commit_hash = sys.argv[1]
    main(commit_hash)
