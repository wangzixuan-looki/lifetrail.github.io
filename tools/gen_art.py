import subprocess
import sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
SPEC = yaml.safe_load((ROOT / "tools" / "art_prompts.yaml").read_text())
RAW = ROOT / "tools" / "raw"


def launch(name, scene):
    prompt = f"{SPEC['task']}\nOutput path: tools/raw/{name}.png\n\nScene: {scene}\nStyle: {SPEC['style']}"
    log = (RAW / f"{name}.log").open("w")
    return subprocess.Popen(
        ["codex", "exec", "--skip-git-repo-check", "--sandbox", "workspace-write", "-C", str(ROOT), prompt],
        stdout=log, stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL,
    )


def main():
    RAW.mkdir(exist_ok=True)
    names = sys.argv[1:] or list(SPEC["images"])
    procs = {name: launch(name, SPEC["images"][name]) for name in names}
    for name, proc in procs.items():
        code = proc.wait()
        print(name, code, (RAW / f"{name}.png").exists())


main()
