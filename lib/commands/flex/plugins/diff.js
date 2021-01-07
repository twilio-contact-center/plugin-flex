"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parser = void 0;
const general_1 = require("../../../utils/general");
const flex_plugin_1 = __importDefault(require("../../../sub-commands/flex-plugin"));
const exceptions_1 = require("../../../exceptions");
const strings_1 = require("../../../utils/strings");
const commandDocs_json_1 = require("../../../commandDocs.json");
/**
 * Configuration sid parser
 * @param input the input from the CLI
 */
exports.parser = (input) => {
    if (input === 'active') {
        return input;
    }
    if (!input || !input.startsWith('FJ')) {
        throw new exceptions_1.TwilioCliError(`Identifier must of a ConfigurationSid or 'active'; instead got ${input}`);
    }
    return input;
};
const baseFlags = Object.assign({}, flex_plugin_1.default.flags);
// @ts-ignore
delete baseFlags.json;
/**
 * Finds the difference between two Flex Plugin Configuration
 */
class FlexPluginsDiff extends flex_plugin_1.default {
    constructor(argv, config, secureStorage) {
        super(argv, config, secureStorage, { runInDirectory: false });
    }
    /**
     * @override
     */
    async doRun() {
        const diffs = await this.getDiffs();
        const oldSidText = diffs.activeSid === diffs.oldSid ? `${diffs.oldSid} (active)` : diffs.oldSid;
        const newSidText = diffs.activeSid === diffs.newSid ? `${diffs.newSid} (active)` : diffs.newSid;
        this._logger.info(`Showing the changes from releasing **${oldSidText}** to **${newSidText}**`);
        this._logger.newline();
        diffs.configuration.forEach((diff) => this.printDiff(diff));
        this._logger.newline();
        this.printHeader('Plugins');
        Object.keys(diffs.plugins).forEach((key) => {
            const isDeleted = diffs.plugins[key].every((diff) => strings_1.isNullOrUndefined(diff.after) && !strings_1.isNullOrUndefined(diff.before));
            const isAdded = diffs.plugins[key].every((diff) => strings_1.isNullOrUndefined(diff.before) && !strings_1.isNullOrUndefined(diff.after));
            if (isDeleted) {
                this._logger.info(`**--- ${key}--**`);
            }
            else if (isAdded) {
                this._logger.info(`**+++ ${key}++**`);
            }
            else {
                this._logger.info(`**${key}**`);
            }
            diffs.plugins[key].forEach((diff) => this.printDiff(diff, FlexPluginsDiff.pluginDiffPrefix));
            this._logger.newline();
        });
    }
    /**
     * Finds the diff
     */
    async getDiffs() {
        // if only one argument is provided, it's because you are comparing "active to configId"
        const { id1, id2 } = this._args;
        return this.pluginsApiToolkit.diff({
            resource: 'configuration',
            oldIdentifier: id2 ? id1 : 'active',
            newIdentifier: id2 ? id2 : id1,
        });
    }
    /**
     * Prints the diff
     * @param diff    the diff to print
     * @param prefix  the prefix to add to each entry
     */
    printDiff(diff, prefix = '') {
        const path = diff.path;
        const before = diff.before;
        const after = diff.after;
        const header = flex_plugin_1.default.getHeader(path);
        if (diff.hasDiff) {
            if (!strings_1.isNullOrUndefined(before)) {
                this._logger.info(`${prefix}--- ${header}: ${flex_plugin_1.default.getValue(path, before)}--`);
            }
            if (!strings_1.isNullOrUndefined(after)) {
                this._logger.info(`${prefix}+++ ${header}: ${flex_plugin_1.default.getValue(path, after)}++`);
            }
        }
        else {
            this._logger.info(`${prefix}${header}: ${flex_plugin_1.default.getValue(path, before)}`);
        }
    }
    /* istanbul ignore next */
    get _flags() {
        return this.parse(FlexPluginsDiff).flags;
    }
    /* istanbul ignore next */
    get _args() {
        return this.parse(FlexPluginsDiff).args;
    }
}
exports.default = FlexPluginsDiff;
FlexPluginsDiff.pluginDiffPrefix = '..│.. ';
FlexPluginsDiff.description = general_1.createDescription(commandDocs_json_1.diff.description, false);
FlexPluginsDiff.args = [
    {
        description: commandDocs_json_1.diff.args.id1,
        name: 'id1',
        required: true,
        parse: exports.parser,
    },
    {
        description: commandDocs_json_1.diff.args.id2,
        name: 'id2',
        arse: exports.parser,
    },
];
FlexPluginsDiff.flags = Object.assign({}, baseFlags);
//# sourceMappingURL=diff.js.map