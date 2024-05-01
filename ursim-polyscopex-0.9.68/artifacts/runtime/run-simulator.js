const {spawn} = require("child_process");
const process = require('process');
const {program, Option} = require("commander");
const PropertiesReader = require('properties-reader');
const fs = require("fs");
const readlineSync = require('readline-sync');

const PROJECT_NAME = 'ursim-polyscopex';
const DOCKER_COMPOSE_PATH = `${process.cwd()}/artifacts/runtime/docker-compose.yml`;
const ENV_FILE = `--env-file=${process.cwd()}/.env`

const APPLICATION_VOLUME = `${PROJECT_NAME}-applications`
const URCAPS_VOLUME = `${PROJECT_NAME}-urcaps`
const NGINX_SNIPPETS_VOLUME = `${PROJECT_NAME}-ur-snippets`
const DOCKER_VOLUME = `${PROJECT_NAME}-docker-volume`

program.addOption(
    new Option("--robotType <Robot Type>", "The type of robot to simulate")
        .choices(["UR3", "UR5", "UR10", "UR12", "UR16", "UR20", "UR30"])
        .default("UR5"))
    .option('--clear-applications', 'Remove applications and programs from previous runs')
    .option('--reset', 'Restore environment to default state (excluding applications and programs')
    .option('--port <port>', 'Set a custom port for accessing the application', "80")
    .action(async () => {
        doReset = false;
        await main()
    });

program.parse();

async function main() {
    process.on("SIGINT", async () => {
        // Trap interrupt (Ctrl-C)
        console.log("::::: Terminating Simulator :::::")
        await stopRunningProcess()
    });

    const doReset = parseParameters();

    writeEnvironmentFile()
    await stopRunningProcess()
    await launchBackendServices(doReset)
}

function parseParameters() {
    const opts = program.opts()
    let doReset = opts.reset
    if ((opts.clearAppplications || opts.port || opts.robotType) && !doReset) {
        // Parameters were set, and --reset was not used
        const resetParams = parametersRequiringReset(opts);
        if (!opts.reset && resetParams.length > 0) {
            // Prompt user if parameters differ from last run and --reset wasn't used, to get acceptance to continue
            console.log("The following parameters requires creating a new Docker container using the --reset flag")
            for (let diff of resetParams) {
                if (diff.param === "--clear-applications") {
                    console.log(`    ${diff.paramName} was specified`)
                } else {
                    console.log(`    ${diff.paramName} - Last Run: ${diff.lastValue}, This Run: ${diff.currentValue}`)
                }
            }
            console.log("WARNING: Continuing will add the --reset flag and remove any installed URCaps")

            if (!readlineSync.keyInYNStrict()) {
                // User does not wish to continue
                console.log("run-simulator cancelled!")
                process.exit(0)
            }
            doReset = true;
        }
        doReset = doReset || opts.reset
    }
    return doReset
}

function parametersRequiringReset(opts) {
    let envFile = null;
    try {
        // Read .env file from last run
        envFile = PropertiesReader(".env");
    } catch (e) {
        // .env file does not exist, probably first run
    }
    const diffs = []
    if (envFile) {
        // Check if current parameters differ with parameters from last run
        if (opts.robotType !== envFile.get("ROBOT_TYPE")) {
            diffs.push({param: "--robotType", paramName: "Robot Type", lastValue: envFile.get("ROBOT_TYPE"), currentValue: opts.robotType})
        }

        if (Number(opts.port) !== Number(envFile.get("PORT"))) {
            diffs.push({param: "--port", paramName: "Port", lastValue: envFile.get("PORT"), currentValue: opts.port})
        }

        if (opts.clearApplications !== undefined && !opts.reset) {
            diffs.push({param: "--clear-applications", paramName: "Clear Applications"})
        }
    }
    return diffs;
}

function writeEnvironmentFile() {
    const content = `ROBOT_TYPE=${program.opts().robotType}
HOST_ARCH=${process.arch}
ROS2_NAMESPACE=UR8888
APPLICATION_VOLUME=${APPLICATION_VOLUME}
URCAPS_VOLUME=${URCAPS_VOLUME}
NGINX_SNIPPETS_VOLUME=${NGINX_SNIPPETS_VOLUME}
DOCKER_VOLUME=${DOCKER_VOLUME}
PORT=${program.opts().port}`
    fs.writeFileSync('.env', content);
}

async function cleanDockerEnv() {
    // Clean up existing containers, networks and anonymous volumes from previous runs
    await executeCommandLine('docker', ['compose', ENV_FILE, '--file', DOCKER_COMPOSE_PATH, '-p', PROJECT_NAME, 'down'])
}

async function stopRunningProcess() {
    // Shutdown development env (but don't remove containers, volumes, etc.)
    await executeCommandLine('docker', ['compose', ENV_FILE, '--file', DOCKER_COMPOSE_PATH, '-p', PROJECT_NAME, 'stop'])
}

async function createDockerVolume(volume) {
    await executeCommandLine('docker', ['volume', 'create', volume], false)
}

async function removeDockerVolume(volume) {
    await executeCommandLine('docker', ['volume', 'rm', volume], false)
}

async function handleDockerVolumes(doReset) {
    console.log("Setting up docker volumes")
    if (program.opts().clearApplications) {
        await removeDockerVolume(APPLICATION_VOLUME)
    }
    await createDockerVolume(APPLICATION_VOLUME)

    if (doReset) {
        await removeDockerVolume(URCAPS_VOLUME)
        await removeDockerVolume(NGINX_SNIPPETS_VOLUME)
        await removeDockerVolume(DOCKER_VOLUME)
    }
    await createDockerVolume(URCAPS_VOLUME)
    await createDockerVolume(NGINX_SNIPPETS_VOLUME)
    await createDockerVolume(DOCKER_VOLUME)
}

async function launchBackendServices(doReset) {
    let creationParam = '--no-recreate'
    if (doReset) {
        await cleanDockerEnv()
        creationParam = '--force-recreate'
    }
    await handleDockerVolumes(doReset)
    await executeCommandLine('docker', ['compose', ENV_FILE, '-p', PROJECT_NAME, '--file', DOCKER_COMPOSE_PATH, 'up', '--remove-orphans', creationParam, '-d']);
    await executeCommandLine('docker', ['compose', ENV_FILE, '--file', DOCKER_COMPOSE_PATH, '-p', PROJECT_NAME, 'logs', '-f'], true, true);
}

async function executeCommandLine(command, params, ignoreStdErr = false, showOutput = true) {
    return new Promise(function (resolve, reject) {
        const proc = spawn(command, params, {stdio: [showOutput ? 'inherit' : 'ignore', showOutput ? 'inherit' : 'ignore', ignoreStdErr ? 'ignore' : 'inherit']});

        proc.on("exit", function (exitCode) {
            resolve()
        });

        proc.on("error", function (err) {
            reject(err);
        })
    });
}
