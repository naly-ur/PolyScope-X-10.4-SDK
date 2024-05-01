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
                    hasSmartSkill: true,
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
                hasWeb: true,
                hasDocker: false,
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
                    smartSkillName: smartSkillName,
                    programComponentName: programComponentName,
                    applicationComponentName: applicationComponentName,
                    smartSkillComponentName: smartSkillComponentName,
                    programTagName: programTagName,
                    applicationTagName: applicationTagName,
                    smartSkillTagName: smartSkillTagName,
                    programNodeTitle: programNodeTitle,
                    applicationNodeTitle: applicationNodeTitle,
                    smartSkillTitle: smartSkillTitle
                }
            );
        }

        const filesToCopy = [
          "src/environments/environment.prod.ts",
          "src/environments/environment.ts",
          "src/main.ts",
          "src/styles.scss",
          ".browserslistrc",
          ".editorconfig",
          ".gitignore",
          "README.md",
          "tsconfig.app.json",
          "tsconfig.json",
          "tsconfig.worker.json",
          "tsconfig.spec.json",
          ".eslintrc.json",
          "karma.conf.js",
        ];
        const filesToTemplateCopy = [
            "angular.json",
            "package.json",
            "manifest.yaml",
            "LICENSE",
            "src/app/app.module.ts",
            "src/assets/i18n/en.json",
            "src/assets/i18n/ur.json",
            "src/contribution.json",
            "src/index.html"
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
            copyTpl('src/app/components/hello-application/hello-application.behavior.worker.ts',
                'src/app/components/' + applicationNodeName + '/' + applicationNodeName + '.behavior.worker.ts');
            copyTpl('src/app/components/hello-application/hello-application.component.html',
                'src/app/components/' + applicationNodeName + '/' + applicationNodeName + '.component.html');
            copyTpl('src/app/components/hello-application/hello-application.component.scss',
                'src/app/components/' + applicationNodeName + '/' + applicationNodeName + '.component.scss');
            copyTpl('src/app/components/hello-application/hello-application.component.ts',
                'src/app/components/' + applicationNodeName + '/' + applicationNodeName + '.component.ts');
            copyTpl('src/app/components/hello-application/hello-application.component.spec.ts',
                'src/app/components/' + applicationNodeName + '/' + applicationNodeName + '.component.spec.ts');
            copyTpl('src/app/components/hello-application/hello-application.node.ts',
                'src/app/components/' + applicationNodeName + '/' + applicationNodeName + '.node.ts');
        }
        if (hasProgramNode) {
            copyTpl('src/app/components/hello-program/hello-program.behavior.worker.ts',
                'src/app/components/' + programNodeName + '/' + programNodeName + '.behavior.worker.ts');
            copyTpl('src/app/components/hello-program/hello-program.component.html',
                'src/app/components/' + programNodeName + '/' + programNodeName + '.component.html');
            copyTpl('src/app/components/hello-program/hello-program.component.scss',
                'src/app/components/' + programNodeName + '/' + programNodeName + '.component.scss');
            copyTpl('src/app/components/hello-program/hello-program.component.ts',
                'src/app/components/' + programNodeName + '/' + programNodeName + '.component.ts');
            copyTpl('src/app/components/hello-program/hello-program.component.spec.ts',
                'src/app/components/' + programNodeName + '/' + programNodeName + '.component.spec.ts');
            copyTpl('src/app/components/hello-program/hello-program.node.ts',
                'src/app/components/' + programNodeName + '/' + programNodeName + '.node.ts');
            this.fs.copy(
                this.templatePath('src/assets/icons/hello-program.svg'),
                this.destinationPath('../' + urcapId + '/src/assets/icons/' + programNodeName + '.svg')
            );
        }
        if (hasSmartSkill) {
            copyTpl('src/app/components/hello-smart-skill/hello-smart-skill.behavior.worker.ts',
                'src/app/components/' + smartSkillName + '/' + smartSkillName + '.behavior.worker.ts');
            copyTpl('src/app/components/hello-smart-skill/hello-smart-skill.component.html',
                'src/app/components/' + smartSkillName + '/' + smartSkillName + '.component.html');
            copyTpl('src/app/components/hello-smart-skill/hello-smart-skill.component.scss',
                'src/app/components/' + smartSkillName + '/' + smartSkillName + '.component.scss');
            copyTpl('src/app/components/hello-smart-skill/hello-smart-skill.component.ts',
                'src/app/components/' + smartSkillName + '/' + smartSkillName + '.component.ts');
            this.fs.copy(
                this.templatePath('src/assets/icons/hello-program.svg'),
                this.destinationPath('../' + urcapId + '/src/assets/icons/' + smartSkillName + '.svg')
            );
        }
    }
};
