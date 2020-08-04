/* eslint-disable camelcase */
import { ConfigurationsDiff } from 'flex-plugins-api-toolkit/dist/tools/diff';

import { expect, createTest } from '../../../framework';
import FlexPluginsDiff from '../../../../commands/flex/plugins/diff';

describe('Commands/FlexPluginsDeploy', () => {
  const { sinon, start } = createTest(FlexPluginsDiff);

  const prefix = FlexPluginsDiff.pluginDiffPrefix;
  const diffs: ConfigurationsDiff = {
    configuration: [
      {
        path: 'name',
        before: 'before-name',
        after: 'after-name',
        hasDiff: true,
      },
      {
        path: 'description',
        before: 'description',
        after: 'description',
        hasDiff: false,
      },
    ],
    plugins: {
      'plugin-one': [
        {
          path: 'pluginVersionSid',
          before: 'FV00000000000000000000000000001',
          after: 'FV00000000000000000000000000002',
          hasDiff: true,
        },
        {
          path: 'phase',
          before: 3,
          after: 3,
          hasDiff: false,
        },
      ],
      'plugin-deleted': [
        {
          path: 'pluginSid',
          before: 'FP00000000000000000000000000001',
          after: null,
          hasDiff: true,
        },
      ],
      'plugin-added': [
        {
          path: 'name',
          before: null,
          after: 'plugin-added',
          hasDiff: true,
        },
      ],
    },
  };

  afterEach(() => {
    sinon.restore();
  });

  start(['FJ00000000000000000000000000001', 'FJ00000000000000000000000000002'])
    .setup(async (instance) => {
      sinon.stub(instance, 'getDiffs').returns(Promise.resolve(diffs));
      sinon.stub(instance, 'printDiff').returnsThis();
      sinon.stub(instance, 'printHeader').returnsThis();
    })
    .test(async (instance) => {
      await instance.doRun();
      expect(instance.getDiffs).to.have.been.calledOnce;
      expect(instance.printHeader).to.have.been.calledOnce;
      expect(instance.printHeader).to.have.been.calledWith('Plugins');
      expect(instance.printDiff).to.have.been.callCount(6);
      expect(instance.printDiff).to.have.been.calledWith(diffs.configuration[0]);
      expect(instance.printDiff).to.have.been.calledWith(diffs.configuration[1]);
      expect(instance.printDiff).to.have.been.calledWith(diffs.plugins['plugin-one'][0], prefix);
      expect(instance.printDiff).to.have.been.calledWith(diffs.plugins['plugin-one'][1], prefix);
      expect(instance.printDiff).to.have.been.calledWith(diffs.plugins['plugin-added'][0], prefix);
      expect(instance.printDiff).to.have.been.calledWith(diffs.plugins['plugin-deleted'][0], prefix);
    })
    .it('should call toolkit and get the diff');
});
