import Generator from "yeoman-generator";
import Utils from "../../utils.js";

export default class extends Generator {
    utils = new Utils();

    async prompting() {
        this.answers = this.config.get('answers');
        if (!this.answers) {
            return;
        }

        if (this.answers.hasWeb) {
            const contributionType = this.config.get('contributionType');
            this.answer = await this.prompt([
                {
                    type: 'list',
                    name: 'contributionType',
                    message: 'What type of URCap Web contribution should be created?',
                    choices: [
                        'Angular',
                        'JavaScript'
                    ],
                    default: contributionType
                }
            ]);
            this.config.set('contributionType', this.answer.contributionType);

            this.webAnswers = await this.prompt([
                {
                    type: 'confirm',
                    name: 'hasProgramNode',
                    message: 'Include Program Node',
                    default: this.answers.hasProgramNode
                }
            ]);

            if (this.webAnswers.hasProgramNode) {
                this.prgnode = await this.prompt([
                    {
                        type: 'input',
                        name: 'programNodeName',
                        message: 'Name of Program Node',
                        validate: this.utils.validateNodeName,
                        default: this.answers.programNodeName
                    }
                ]);
            }

            this.applicationAnswer = await this.prompt([
                {
                    type: 'confirm',
                    name: 'hasApplicationNode',
                    message: 'Include Application Node',
                    default: this.answers.hasApplicationNode
                }
            ]);

            if (this.applicationAnswer.hasApplicationNode) {
                this.appnode = await this.prompt([
                    {
                        type: 'input',
                        name: 'applicationNodeName',
                        message: 'Name of Application Node',
                        validate: this.utils.validateNodeName,
                        default: this.answers.applicationNodeName
                    }
                ]);
            }

            this.smartSkillAnswer = await this.prompt([
                {
                    type: 'confirm',
                    name: 'hasSmartSkill',
                    message: 'Include Smart Skill',
                    default: this.answers.hasSmartSkill
                }
            ]);

            if (this.smartSkillAnswer.hasSmartSkill) {
                this.smartskill = await this.prompt([
                    {
                        type: 'input',
                        name: 'smartSkillName',
                        message: 'Name of Smart Skill',
                        validate: this.utils.validateNodeName,
                        default: this.answers.smartSkillName
                    }
                ]);
            }

            if (!this.prgnode) {
                this.prgnode = {
                    programNodeName: ''
                }
            }

            if (!this.appnode) {
                this.appnode = {
                    applicationNodeName: ''
                }
            }

            if (!this.smartskill) {
                this.smartskill = {
                    smartSkillName: ''
                }
            }

            this.config.set('answers', {
                ...this.answers,
                hasProgramNode: this.webAnswers.hasProgramNode,
                hasApplicationNode: this.applicationAnswer.hasApplicationNode,
                hasSmartSkill: this.smartSkillAnswer.hasSmartSkill,
                programNodeName: this.utils.trim(this.prgnode.programNodeName.toLowerCase()),
                applicationNodeName: this.utils.trim(this.appnode.applicationNodeName.toLowerCase()),
                smartSkillName: this.utils.trim(this.smartskill.smartSkillName.toLowerCase())
            });

            if(this.prgnode.programNodeName !== '' || this.appnode.applicationNodeName !== ''){
                if (this.prgnode.programNodeName === this.appnode.applicationNodeName) {
                    this.env.error("Creating new URCap Contribution failed with error: The application name and program name must not be identical");
                }
            }
        }
    }
};
