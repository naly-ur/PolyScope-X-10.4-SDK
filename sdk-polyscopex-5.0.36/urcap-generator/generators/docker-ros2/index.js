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
                    hasWeb: false,
                    hasROS2: true
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
        const ros2NodeName = this.utils.toROS2NodeName(urcapId);
        const ros2NodeDesc = this.answers.urcapName;

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
                    ros2NodeName: ros2NodeName,
                    ros2NodeDesc: ros2NodeDesc
                }
            );
        }
        const filesToCopy = [
          ".gitignore",
          "README.md",
          "requirements.txt"
        ];
        const filesToTemplateCopy = [
            "package.json",
            "manifest.yaml",
            "LICENSE",
            "Dockerfile"
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
        copyTpl('src/ros2_node/resource/ros2_node', 'src/' +  ros2NodeName + '/resource/' + ros2NodeName);
        copyTpl('src/ros2_node/ros2_node/__init__.py', 'src/' +  ros2NodeName + '/' + ros2NodeName + '/__init__.py');
        copyTpl('src/ros2_node/ros2_node/main.py', 'src/' +  ros2NodeName + '/' + ros2NodeName + '/main.py');
        copyTpl('src/ros2_node/package.xml', 'src/' +  ros2NodeName + '/package.xml');
        copyTpl('src/ros2_node/setup.cfg', 'src/' +  ros2NodeName + '/setup.cfg');
        copyTpl('src/ros2_node/setup.py', 'src/' +  ros2NodeName + '/setup.py');
    }
};
