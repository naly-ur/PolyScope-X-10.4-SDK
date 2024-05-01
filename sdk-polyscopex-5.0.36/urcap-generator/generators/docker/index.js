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
                    programNodeName: undefined,
                    applicationNodeName: undefined,
                    hasDocker: true,
                    hasWeb: false
                };
                this.config.set('answers', this.answers);
            }
            this.composeWith(require.resolve('../prompt-urcap'));
        }
    }

    writing() {
        this.config.set('prompted', 'false');
        this.answers = this.config.get('answers');
        const urcapId = this.answers.urcapId;
        const vendorId = this.answers.vendorId;

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
                }
            );
        }
        const filesToCopy = [
          ".gitignore",
          "README.md",
          "Dockerfile"
        ];
        const filesToTemplateCopy = [
            "package.json",
            "manifest.yaml",
            "LICENSE"
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
    }
};
