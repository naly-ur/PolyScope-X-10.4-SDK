import Generator from "yeoman-generator";
import Utils from "../../utils.js";

export default class extends Generator {
    utils = new Utils();

    async prompting() {
        this.answers = this.config.get('answers');
        if (this.answers.hasDocker || this.answers.hasWeb) {
            this.urcapAnswers = await this.prompt([
                {
                    type: 'input',
                    name: 'vendorName',
                    message: 'Name of Vendor',
                    default: this.answers.vendorName
                },
                {
                    type: 'input',
                    name: 'vendorId',
                    message: 'Id of Vendor',
                    validate: this.utils.validateVendorId,
                    default: this.answers.vendorId
                },
                {
                    type: 'input',
                    name: 'urcapName',
                    message: 'Name of URCap Contribution',
                    default: this.answers.urcapName
                },
                {
                    type: 'input',
                    name: 'urcapId',
                    message: 'Id of URCap Contribution',
                    validate: this.utils.validateURCapId,
                    default: this.answers.urcapId
                }
            ]);

            this.config.set('answers', {
                ...this.answers,
                vendorName: this.urcapAnswers.vendorName,
                vendorId: this.urcapAnswers.vendorId.toLowerCase(),
                urcapName: this.urcapAnswers.urcapName,
                urcapId: this.urcapAnswers.urcapId.toLowerCase(),
                artifactId: this.urcapAnswers.urcapId,
                contribution: this.urcapAnswers.urcapId,
            });
        }
        this.config.set('prompted', 'true');
    }
};
