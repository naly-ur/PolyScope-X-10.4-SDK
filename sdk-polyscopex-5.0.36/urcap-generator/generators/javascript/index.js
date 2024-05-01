import Generator from "yeoman-generator";
import Utils from "../../utils.js";

export default class extends Generator {
    utils = new Utils();

    async prompting() {
        this.prompted = this.config.get('prompted');
        if (!this.prompted || this.prompted === 'false') {
            this.answers = this.config.get('answers');
            if (!this.answers) {
                this.answers = {
                    vendorName: undefined,
                    vendorId: undefined,
                    urcapName: undefined,
                    urcapId: undefined,
                    hasProgramNode: true,
                    hasApplicationNode: true,
                    hasScriptNode: true,
                    programNodeName: undefined,
                    applicationNodeName: undefined,
                    smartSkillName: undefined,
                    hasDocker: false,
                    hasWeb: true,
                    hasROS2: false
                };
            }
            this.config.set('answers', {
                ...this.answers,
                hasDocker: false,
                hasWeb: true,
                hasROS2: false
            });
            this.composeWith(require.resolve('../prompt-urcap'));
            this.composeWith(require.resolve('../prompt-web'));
        }
    }

    writing() {
        this.config.set('prompted', 'false');
        this.answers = this.config.get('answers');

        const urcapId = this.answers.urcapId;
        const vendorId = this.answers.vendorId;
        const hasProgramNode = this.answers.hasProgramNode;
        const hasApplicationNode = this.answers.hasApplicationNode;
        const hasSmartSkill = this.answers.hasSmartSkill;
        const programNodeName = this.answers.programNodeName;
        const applicationNodeName = this.answers.applicationNodeName;
        const smartSkillName = this.answers.smartSkillName;
        const programComponentName = this.utils.toCamelcase(programNodeName);
        const applicationComponentName = this.utils.toCamelcase(applicationNodeName);
        const smartSkillComponentName = this.utils.toCamelcase(smartSkillName);
        const programTagName =
            this.utils.toTagName(vendorId) + "-" +
            this.utils.toTagName(urcapId) + "-" +
            this.utils.toTagName(programNodeName);
        const applicationTagName =
            this.utils.toTagName(vendorId) + "-" +
            this.utils.toTagName(urcapId) + "-" +
            this.utils.toTagName(applicationNodeName);
        const smartSkillTagName =
            this.utils.toTagName(vendorId) + "-" +
            this.utils.toTagName(urcapId) + "-" +
            this.utils.toTagName(smartSkillName);
        const programNodeTitle = this.utils.toTitle(programNodeName);
        const applicationNodeTitle = this.utils.toTitle(applicationNodeName);
        const smartSkillTitle = this.utils.toTitle(smartSkillName);

        const copyTpl = (src, dest) => {
            this.fs.copyTpl(
                this.templatePath(src),
                this.destinationPath('../' + urcapId + '/' + dest),
                {
                    vendorName: this.answers.vendorName,
                    vendorId: vendorId,
                    urcapName: this.answers.urcapName,
                    urcapId: urcapId,
                    artifactId: urcapId,
                    contribution: urcapId,
                    hasProgramNode: hasProgramNode,
                    hasApplicationNode: hasApplicationNode,
                    hasSmartSkill: hasSmartSkill,
                    programNodeName: programNodeName,
                    applicationNodeName: applicationNodeName,
                    programComponentName: programComponentName,
                    applicationComponentName: applicationComponentName,
                    smartSkillComponentName: smartSkillComponentName,
                    programTagName: programTagName,
                    applicationTagName: applicationTagName,
                    smartSkillTagName: smartSkillTagName,
                    programNodeTitle: programNodeTitle,
                    applicationNodeTitle: applicationNodeTitle,
                    smartSkillTitle: smartSkillTitle,
                }
            );
        }

        const filesToCopy = [
          ".editorconfig",
          ".gitignore",
          "README.md",
          ".eslintrc.json"
        ];
        const filesToTemplateCopy = [
            "webpack.config.js",
            "package.json",
            "manifest.yaml",
            "LICENSE",
            "src/index.js",
            "src/contribution.json",
            "src/assets/i18n/en.json",
            "src/assets/i18n/ur.json"
        ];
        for (let i = 0; i < filesToCopy.length; i++) {
            this.fs.copy(
                this.templatePath(filesToCopy[i]),
                this.destinationPath('../' + urcapId + '/' + filesToCopy[i])
            );
        }
        for (let i = 0; i < filesToTemplateCopy.length; i++) {
            copyTpl(filesToTemplateCopy[i], filesToTemplateCopy[i]);
        }
        if (hasApplicationNode) {
            copyTpl('src/application/hello-application.js',
                'src/application/' + applicationNodeName + ".component.js");
            copyTpl('src/application/hello-application.behavior.worker.js',
                'src/application/' + applicationNodeName + ".behavior.worker.js");
        }
        if (hasProgramNode) {
            copyTpl('src/program/hello-program.js',
                'src/program/' + programNodeName + ".component.js");
            copyTpl('src/program/hello-program.behavior.worker.js',
                'src/program/' + programNodeName + ".behavior.worker.js");
            this.fs.copy(
                this.templatePath('src/assets/icons/hello-program.svg'),
                this.destinationPath('../' + urcapId + '/src/assets/icons/' + programNodeName + '.svg')
            );
        }
        if (hasSmartSkill) {
            copyTpl('src/smart-skill/hello-smart-skill.behavior.worker.js',
                'src/smart-skill/' + smartSkillName + '.behavior.worker.js')
        }

    }
};
