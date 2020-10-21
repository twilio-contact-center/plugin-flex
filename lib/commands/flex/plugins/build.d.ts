import FlexPlugin from '../../../sub-commands/flex-plugin';
/**
 * Builds the the plugin bundle
 */
export default class FlexPluginsBuild extends FlexPlugin {
    static description: string;
    static flags: {
        json: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        'clear-terminal': import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
        region: import("@oclif/command/lib/flags").IOptionFlag<string>;
    };
    /**
     * @override
     */
    doRun(): Promise<void>;
    get _flags(): {
        json: boolean;
        'clear-terminal': boolean;
        region: string;
    };
}
