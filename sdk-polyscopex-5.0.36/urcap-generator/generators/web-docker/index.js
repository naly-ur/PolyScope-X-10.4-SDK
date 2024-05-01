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
                    hasDocker: true,
                    hasWeb: true,
                    hasROS2: false
                };
            }
            this.config.set('answers', {
                ...this.answers,
                hasWeb: true,
                hasDocker: true,
                hasROS2: false
            });
            this.composeWith(require.resolve('../prompt-urcap'));
            this.composeWith(require.resolve('../prompt-web'));
        }
    }

    writing() {
        this.config.set('prompted', 'false');
        this.answers = this.config.get('answers');
        this.contributionType = this.config.get('contributionType');
        const urcapId = this.answers.urcapId;
        const frontendId = urcapId + "-frontend";
        const backendId = urcapId + "-backend";
        const mainId = urcapId;
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
            this.utils.toTagName(frontendId) + "-" +
            this.utils.toTagName(programNodeName);
        const applicationTagName =
            this.utils.toTagName(vendorId) + "-" +
            this.utils.toTagName(frontendId) + "-" +
            this.utils.toTagName(applicationNodeName);
        const smartSkillTagName =
            this.utils.toTagName(vendorId) + "-" +
            this.utils.toTagName(urcapId) + "-" +
            this.utils.toTagName(smartSkillName);
        const programNodeTitle = this.utils.toTitle(programNodeName);
        const applicationNodeTitle = this.utils.toTitle(applicationNodeName);
        const smartSkillTitle = this.utils.toTitle(smartSkillName);
        const copyTpl = (src, dest, mainId, subId = undefined) => {
            const destPath = subId ? '../' + mainId + '/' + subId + '/' + dest : '../' + mainId + '/' + dest;
            const id = subId ? subId : mainId;
            this.fs.copyTpl(
                this.templatePath(src),
                this.destinationPath(destPath),
                {
                    vendorName: this.answers.vendorName,
                    vendorId: vendorId,
                    urcapName: this.answers.urcapName,
                    urcapId: id,
                    artifactId: id,
                    contribution: id,
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

        const filesToTemplateCopy = [
            "package.json",
            "manifest.yaml",
            "LICENSE"
        ];
        for (let i = 0; i < filesToTemplateCopy.length; i++) {
            copyTpl(filesToTemplateCopy[i], filesToTemplateCopy[i], mainId);
        }
        if (this.contributionType === 'Angular') {
            const angularFilesToCopy = [
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
            const angularFilesToTemplateCopy = [
                "angular.json",
                "src/app/app.module.ts",
                "src/assets/i18n/en.json",
                "src/assets/i18n/ur.json",
                "src/contribution.json",
                "src/index.html"
            ];
            for (let i = 0; i < angularFilesToCopy.length; i++) {
                this.fs.copy(
                    this.templatePath('../../angular/templates/' + angularFilesToCopy[i]),
                    this.destinationPath('../' + mainId + '/' + frontendId + '/' + angularFilesToCopy[i])
                );
            }
            for (let i = 0; i < angularFilesToTemplateCopy.length; i++) {
                copyTpl('../../angular/templates/' + angularFilesToTemplateCopy[i],
                     angularFilesToTemplateCopy[i], mainId, frontendId);
            }
            copyTpl('angular/package.json',  'package.json', mainId, frontendId);

            const srcPath = '../../angular/templates/src/app/components/';
            const destPath = 'src/app/components/';
            if (hasApplicationNode) {
                copyTpl(srcPath + 'hello-application/hello-application.behavior.worker.ts',
                    destPath + applicationNodeName + '/' + applicationNodeName + '.behavior.worker.ts', mainId, frontendId);
                copyTpl(srcPath + 'hello-application/hello-application.component.html',
                    destPath + applicationNodeName + '/' + applicationNodeName + '.component.html', mainId, frontendId);
                copyTpl(srcPath + 'hello-application/hello-application.component.scss',
                    destPath + applicationNodeName + '/' + applicationNodeName + '.component.scss', mainId, frontendId);
                copyTpl(srcPath + 'hello-application/hello-application.component.ts',
                    destPath + applicationNodeName + '/' + applicationNodeName + '.component.ts', mainId, frontendId);
                copyTpl(srcPath + 'hello-application/hello-application.component.spec.ts',
                    destPath + applicationNodeName + '/' + applicationNodeName + '.component.spec.ts', mainId, frontendId);
                copyTpl(srcPath + 'hello-application/hello-application.node.ts',
                    destPath + applicationNodeName + '/' + applicationNodeName + '.node.ts', mainId, frontendId);
            }
            if (hasProgramNode) {
                copyTpl(srcPath + 'hello-program/hello-program.behavior.worker.ts',
                    destPath + programNodeName + '/' + programNodeName + '.behavior.worker.ts', mainId, frontendId);
                copyTpl(srcPath + 'hello-program/hello-program.component.html',
                    destPath + programNodeName + '/' + programNodeName + '.component.html', mainId, frontendId);
                copyTpl(srcPath + 'hello-program/hello-program.component.scss',
                    destPath + programNodeName + '/' + programNodeName + '.component.scss', mainId, frontendId);
                copyTpl(srcPath + 'hello-program/hello-program.component.ts',
                    destPath + programNodeName + '/' + programNodeName + '.component.ts', mainId, frontendId);
                copyTpl(srcPath + 'hello-program/hello-program.component.spec.ts',
                    destPath + programNodeName + '/' + programNodeName + '.component.spec.ts', mainId, frontendId);
                copyTpl(srcPath + 'hello-program/hello-program.node.ts',
                    destPath + programNodeName + '/' + programNodeName + '.node.ts', mainId, frontendId);
                this.fs.copy(
                    this.templatePath('../../angular/templates/src/assets/icons/hello-program.svg'),
                    this.destinationPath('../' + mainId + '/' + frontendId + '/src/assets/icons/'
                        + programNodeName + '.svg')
                );
            }
            if (hasSmartSkill) {
                copyTpl(srcPath + 'hello-smart-skill/hello-smart-skill.behavior.worker.ts',
                    destPath + smartSkillName + '/' + smartSkillName + '.behavior.worker.ts', mainId, frontendId);
                copyTpl(srcPath + 'hello-smart-skill/hello-smart-skill.component.html',
                    destPath + smartSkillName + '/' + smartSkillName + '.component.html', mainId, frontendId);
                copyTpl(srcPath + 'hello-smart-skill/hello-smart-skill.component.scss',
                    destPath + smartSkillName + '/' + smartSkillName + '.component.scss', mainId, frontendId);
                copyTpl(srcPath + 'hello-smart-skill/hello-smart-skill.component.ts',
                    destPath + smartSkillName + '/' + smartSkillName + '.component.ts', mainId, frontendId);
                this.fs.copy(
                    this.templatePath('../../angular/templates/src/assets/icons/hello-program.svg'),
                    this.destinationPath('../' + mainId + '/' + frontendId + '/src/assets/icons/' + smartSkillName + '.svg')
                );
            }
        } else {
            const javaScriptFilesToCopy = [
                ".editorconfig",
                ".gitignore",
                "README.md",
                ".eslintrc.json"
            ];
            const javaScriptFilesToTemplateCopy = [
                "webpack.config.js",
                "src/index.js",
                "src/contribution.json",
                "src/assets/i18n/en.json",
                "src/assets/i18n/ur.json"
            ];

            for (let i = 0; i < javaScriptFilesToCopy.length; i++) {
                this.fs.copy(
                    this.templatePath('../../javascript/templates/' + javaScriptFilesToCopy[i]),
                    this.destinationPath('../' + mainId + '/' + frontendId + '/' + javaScriptFilesToCopy[i])
                );
            }
            for (let i = 0; i < javaScriptFilesToTemplateCopy.length; i++) {
                copyTpl('../../javascript/templates/' + javaScriptFilesToTemplateCopy[i],
                    javaScriptFilesToTemplateCopy[i], mainId, frontendId);
            }
            copyTpl('javascript/package.json', 'package.json', mainId, frontendId);

            const srcPath = '../../javascript/templates/src/';
            const destPath = 'src/';
            if (hasApplicationNode) {
                copyTpl(srcPath + 'application/hello-application.js',
                    destPath + 'application/' + applicationNodeName + ".component.js", mainId, frontendId);
                copyTpl(srcPath + 'application/hello-application.behavior.worker.js',
                    destPath + 'application/' + applicationNodeName + ".behavior.worker.js", mainId, frontendId);
            }
            if (hasProgramNode) {
                copyTpl(srcPath + 'program/hello-program.js',
                    destPath + 'program/' + programNodeName + ".component.js", mainId, frontendId);
                copyTpl(srcPath + 'program/hello-program.behavior.worker.js',
                    destPath + 'program/' + programNodeName + ".behavior.worker.js", mainId, frontendId);
                this.fs.copy(
                    this.templatePath(srcPath + '/assets/icons/hello-program.svg'),
                    this.destinationPath('../' + mainId + '/' + frontendId + '/' + destPath + '/assets/icons/' + programNodeName + '.svg')
                );
            }
            if (hasSmartSkill) {
                copyTpl(srcPath + 'smart-skill/hello-smart-skill.behavior.worker.js',
                    destPath + 'smart-skill/' + smartSkillName + '.behavior.worker.js', mainId, frontendId)
            }
        }
        const dockerFilesToCopy = [
            "Dockerfile",
            ".gitignore",
            "README.md",
        ];
        const filesToCopy = [
            "README.md"
        ];
        for (let i = 0; i < dockerFilesToCopy.length; i++) {
            this.fs.copy(
                this.templatePath('../../docker/templates/' + dockerFilesToCopy[i]),
                this.destinationPath('../' + mainId + '/' + backendId + '/' + dockerFilesToCopy[i])
            );
        }
        copyTpl('docker/package.json', 'package.json', mainId, backendId);
        for (let i = 0; i < filesToCopy.length; i++) {
            this.fs.copy(
                this.templatePath(filesToCopy[i]),
                this.destinationPath('../' + mainId + '/' + filesToCopy[i])
            );
        }
    }
};
