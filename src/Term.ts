import { exec } from "@actions/exec";

const INSTALL_STEP = "install";
const BUILD_STEP = "build";

class Term {
  async execSizeLimit(
    branch?: string,
    skipStep?: string,
    buildScript?: string,
    windowsVerbatimArguments?: boolean,
    directory?: string,
    packageManager?: string,
  ): Promise<{ status: number; output: string }> {
    let output = "";

    if (branch) {
      try {
        await exec(`git fetch origin ${branch} --depth=1`);
      } catch (error) {
        console.log("Fetch failed", error.message);
      }

      await exec(`git checkout -f ${branch}`);
    }

    if (skipStep !== INSTALL_STEP && skipStep !== BUILD_STEP) {
      await exec(`${packageManager} install`, [], {
        cwd: directory
      });
    }

    if (skipStep !== BUILD_STEP) {
      const script = buildScript || "build";
      await exec(`${packageManager} run ${script}`, [], {
        cwd: directory
      });
    }

    const status = await exec("npx size-limit --json", [], {
      windowsVerbatimArguments,
      ignoreReturnCode: true,
      listeners: {
        stdout: (data: Buffer) => {
          output += data.toString();
        }
      },
      cwd: directory
    });

    return {
      status,
      output
    };
  }
}

export default Term;
