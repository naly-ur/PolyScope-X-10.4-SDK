import Generator from "yeoman-generator";
import Utils from "../../utils.js";
import fs from "fs";
import chalk from "chalk";
import {createRequire} from 'node:module';
import {spawn} from "child_process";

const require = createRequire(import.meta.url);

/*
    Due to some issues with the yeoman generator with specific paths, it is possible to get into an
    infinite loop. The following function will try to test the path that could be the issue and if
    the issue occurs will then fail the generator and ask the user to possibly try another path.
 */
async function testIfPathMightGetRegexIntoInfiniteLoop() {

    const {spawn} = require('child_process');

    /*
        This function will test the specific path with the REGEX that is Yeoman generator is using
        This is the REGEX that we have seen hang the yo-process if the path is "wrong".
        An example of the slight difference between good and bad is provided here:
        Good: home:tsha:git:sdk:internal:target:polyscopex-0.11.61-snapshot:sdk-polyscopex-5.0.19
        Bad: home:tsha:git:sdk:internal:target:polyscopex-0.11.61-SNAPSHOT:sdk-polyscopex-5.0.19
     */
    async function testPathWithYeomanRegex() {
        //  This REGEX is located here:
        // https://github.com/yeoman/yeoman-api/blob/6a5bf931273cb1816020797cc34a2d6c73a73deb/workspaces/namespace/src/namespace/index.ts#L3
        const NAMESPACE_REGEX = /^(?:(@[a-z\d-~][a-z\d-._~]*)\/)?([a-z\d-~][a-z\d-._~]*)(?::((?:[a-z\d-~][a-z\d-._~]*:?)*))?(?:@([a-z\d-.~><+=^* ]*)@?)?(?:#((?:[a-z\d-~][a-z\d-._~]*|\*)))?(?:\+((?:[a-zA-Z\d]\w*\+?)*))?(\?)?$/;
        let path = process.cwd()
        path = path.replaceAll("/", ":").replace(/^:/, '')
        NAMESPACE_REGEX.exec(path)
    }

    async function runFunctionWithTimeout() {
        const serializedFunction = `(${testPathWithYeomanRegex.toString()})();`;
        const command = 'node';
        const args = ['-e', serializedFunction];

        let childProcess;
        const regexPromise = new Promise((resolve, reject) => {
            childProcess = spawn(command, args, {stdio: 'inherit'});
            childProcess.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Child process exited with code ${code}`));
                }
            });
        });

        const timeoutPromise = new Promise(function (_, reject) {
            setTimeout(function () {
                reject(new Error('Timed out'));
            }, 1000);
        })

        let pathTimeOutsRegex = false
        try {
            await Promise.race([regexPromise, timeoutPromise]);
        } catch (error) {
            console.error(error)
            pathTimeOutsRegex = true;
        } finally {
            childProcess.kill();
        }

        return pathTimeOutsRegex;
    }

    return await runFunctionWithTimeout();
}

export default class extends Generator {
    utils = new Utils();

    constructor(args, opts) {
        super(args, opts);

        this.argument("vendorName", { type: String, desc: "Vendor Name or Company Name, like: Universal Robots", required: false });
        this.argument("vendorId", { type: String, desc: "Vendor Id or Company Id, like: com.ur.urplus", required: false });
        this.argument("urcapName", { type: String, desc: "UR Plus contribution name, like: My gripper", required: false });
        this.argument("urcapId", { type: String, desc: "Id of UR Plus contribution, like: mygripper", required: false });
        this.argument("contributionType", { type: String, desc: "Contribution type: Angular or JavaScript", required: false });
        this.argument("programNodeName", { type: String, desc: "Name of program node, like: my-prg", required: false });
        this.argument("applicationNodeName", { type: String, desc: "Name of application node, like: my-app", required: false });
        this.argument("smartSkillName", { type: String, desc: "Name of Smart Skill node, like: my-smartskill", required: false });

        this.option("applicationNode", { type: Boolean, desc: "Include an application node in the contribution", required: false, default: false});
        this.option("programNode", { type: Boolean, desc: "Include a program node in the contribution", required: false, default: false});
        this.option("smartSkill", { type: Boolean, desc: "Include a smartskill node in the contribution", required: false, default: false});
        this.option("forceReplace", { type: Boolean, desc: "Replace contribution if already exists", required: false, default: false});
        this.option("docker", { type: Boolean, desc: "Include a Docker Contribution", required: false, default: false});
        this.option("web", { type: Boolean, desc: "Include a Web Contribution", required: false, default: false});
        this.option("ros2", { type: Boolean, desc: "Include ROS2 Docker support", required: false, default: false});
    }

    async prompting() {

        if (await testIfPathMightGetRegexIntoInfiniteLoop()) {
            console.error("Unfortunately it looks like the path you use:", process.cwd())
            console.error("might interfere with the YEOMAN Generator. This might be due to capital")
            console.error("letters in the path. This generator is stopped such that we try to not")
            console.error("go into an infinite loop.")
            process.exit(1)
        }

        if (this.options.vendorName && this.options.vendorId && this.options.urcapName && this.options.urcapId) {
            if (this.options.web) {
                if (this.options.contributionType && this.options.contributionType.toLowerCase() === 'angular') {
                    this.options.contributionType = "Angular"
                } else {
                    this.options.contributionType = "JavaScript"
                }

                this.answer = {
                    contributionType: this.options.contributionType
                }
                if (!this.options.programNode || !this.options.applicationNodeName) {
                    this.options.applicationNodeName = this.options.programNodeName;
                }
            } else {
                this.answer = {
                    contributionType: ''
                }
            }
            if (!this.options.programNodeName) {
                this.options.programNodeName = '';
            }
            if (!this.options.applicationNodeName) {
                this.options.applicationNodeName = '';
            }
            if (!this.options.smartSkillName) {
                this.options.smartSkillName = '';
            }
            var answers = {
                vendorName: this.options.vendorName,
                vendorId: this.options.vendorId,
                urcapName: this.options.urcapName,
                urcapId: this.options.urcapId,
                artifactId: this.options.urcapId,
                contribution: this.options.urcapId,
                hasApplicationNode: this.options.applicationNode,
                hasProgramNode: this.options.programNode,
                hasSmartSkill: this.options.smartSkill,
                programNodeName: this.utils.trim(this.options.programNodeName.toLowerCase()),
                applicationNodeName: this.utils.trim(this.options.applicationNodeName.toLowerCase()),
                smartSkillName: this.utils.trim(this.options.smartSkillName.toLowerCase()),
                hasDocker: this.options.docker,
                hasWeb: this.options.web,
                hasROS2: this.options.ros2
            };
            const validateVendorId = this.utils.validateVendorId(answers.vendorId);
            if (validateVendorId !== true) {
                this.env.error("Creating new URCap Contribution failed with error: " + validateVendorId);
                return;
            }

            if (this.options.forceReplace) {
                if (fs.existsSync('../' + answers.urcapId)) {
                    fs.rmdirSync('../' + answers.urcapId, {recursive: true});
                }
            }

            const validateURCapId = this.utils.validateURCapId(answers.urcapId);
            if (validateURCapId !== true) {
                this.env.error("Creating new URCap Contribution failed with error: " + validateURCapId);
                return;
            }

            if (answers.hasProgramNode) {
                const validateProgramNodeName = this.utils.validateNodeName(answers.programNodeName);
                if (validateProgramNodeName !== true) {
                    this.env.error("Creating new URCap Contribution failed with error: " + validateProgramNodeName);
                    return;
                }
            }

            if (answers.hasApplicationNode) {
                const validateApplicationNodeName = this.utils.validateNodeName(answers.applicationNodeName);
                if (validateApplicationNodeName !== true) {
                    this.env.error("Creating new URCap Contribution failed with error: " + validateApplicationNodeName);
                    return;
                }
            }

            if (answers.hasSmartSkill) {
                const validateSmartSkillNodeName = this.utils.validateNodeName(answers.smartSkillName);
                if (validateSmartSkillNodeName !== true) {
                    this.env.error("Creating new URCap Contribution failed with error: " + validateSmartSkillNodeName);
                    return;
                }
            }

            this.config.set('answers', answers);
            this.config.set('prompted', 'true');
            this.config.set('contributionType', this.answer.contributionType);
            return;
        }

        this.answers = this.config.get('answers');

        if (!this.answers) {
            this.answers = {
                vendorName: undefined,
                vendorId: undefined,
                urcapName: undefined,
                urcapId: undefined,
                hasProgramNode: true,
                hasApplicationNode: true,
                programNodeName: undefined,
                applicationNodeName: undefined,
                smartSkillName: undefined,
                hasDocker: false,
                hasWeb: false,
                hasROS2: false
            };
        }

        this.dockerweb = await this.prompt([
            {
                type    : 'confirm',
                name    : 'hasWeb',
                message : 'Include a Web Contribution (frontend)',
                default : this.answers.hasWeb
            },
            {
                type    : 'confirm',
                name    : 'hasDocker',
                message : 'Include a Docker Container Contribution (backend)',
                default : this.answers.hasDocker
            }
        ]);
        if (this.dockerweb.hasDocker) {
            this.dockerROS2 = await this.prompt([
                {
                    type    : 'confirm',
                    name    : 'hasROS2',
                    message : 'Include ROS2 Docker support',
                    default : this.answers.hasROS2
                }
            ]);
        } else {
            this.dockerROS2 = false;
        }
        this.config.set('answers', {
            ...this.answers,
            hasDocker: this.dockerweb.hasDocker,
            hasWeb: this.dockerweb.hasWeb,
            hasROS2: this.dockerROS2.hasROS2
        });

        this.composeWith(require.resolve('../prompt-urcap'));

        if (this.dockerweb.hasWeb) {
            this.composeWith(require.resolve('../prompt-web'));
        }
        this.config.set('prompted', 'true');
    }

    writing() {
        this.answers = this.config.get('answers');
        this.contributionType = this.config.get('contributionType');
        var composeWithPath = "";
        if (this.answers.hasDocker) {
            const path = this.answers.hasWeb ? '../web-' : '../';
            composeWithPath = this.answers.hasROS2 ? path + 'docker-ros2' : path + 'docker';
            this.composeWith(require.resolve(composeWithPath));
            return;
        }
        if (this.answers.hasWeb) {
            composeWithPath = this.contributionType == 'Angular' ? '../angular' : '../javascript';
            this.composeWith(require.resolve(composeWithPath));
        }
    }

    end() {
        this.answers = this.config.get('answers');

        if (this.answers.hasDocker || this.answers.hasWeb) {
            this.log('\nNew URCap Contribution created.\nTo create final zip file, go to folder '
                + chalk.green(this.answers.urcapId) + ' and run '
                + chalk.green('npm install') + ' and '
                + chalk.green('npm run build'));
        } else {
            this.log('\nNo URCap Contribution created.');
        }
    }
};
