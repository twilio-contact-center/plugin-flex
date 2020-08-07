import * as pluginBuilderStartScript from 'flex-plugin-scripts/dist/scripts/start';

import { expect, createTest } from '../../../framework';
import FlexPluginsStart from '../../../../commands/flex/plugins/start';
import { TwilioCliError } from '../../../../exceptions';

describe('Commands/FlexPluginsStart', () => {
  const { sinon, start } = createTest(FlexPluginsStart);
  const pkg = {
    name: 'pluginOne',
    dependencies: {
      'flex-plugin-scripts': '4.0.0',
    },
  };
  const badVersionPkg = {
    name: 'pluginBad',
    dependencies: {
      'flex-plugin-scripts': '3.9.9',
    },
  };
  const badPluginsPkg = {
    name: 'fakePlugin',
  };
  const config = {
    plugins: [
      { name: 'pluginOne', dir: 'test-dir', port: 0 },
      { name: 'pluginTwo', dir: 'test-dir', port: 0 },
      { name: 'pluginBad', dir: 'test-dir', port: 0 },
    ],
  };

  let findPortAvailablePort = sinon.stub(pluginBuilderStartScript, 'findPortAvailablePort');

  afterEach(() => {
    sinon.restore();

    findPortAvailablePort = sinon.stub(pluginBuilderStartScript, 'findPortAvailablePort');
  });

  start()
    .setup((instance) => {
      sinon.stub(instance, 'runScript').returnsThis();
      sinon.stub(instance, 'spawnScript').returnsThis();
      sinon.stub(instance, 'isPluginFolder').returns(true);
      sinon.stub(instance, 'pkg').get(() => pkg);
      sinon.stub(instance, 'pluginsConfig').get(() => config);
      findPortAvailablePort.returns(Promise.resolve(100));
    })
    .test(async (instance) => {
      await instance.doRun();

      expect(instance.runScript).to.have.been.calledTwice;
      expect(instance.runScript).to.have.been.calledWith('start', ['flex', '--name', pkg.name]);
      expect(instance.runScript).to.have.been.calledWith('check-start', ['--name', pkg.name]);
      expect(instance.spawnScript).to.have.been.calledWith('start', ['plugin', '--name', pkg.name, '--port', '100']);
    })
    .it('should run start script for the directory plugin');

  start()
    .setup((instance) => {
      sinon.stub(instance, 'runScript').returnsThis();
      sinon.stub(instance, 'spawnScript').returnsThis();
      sinon.stub(instance, 'isPluginFolder').returns(true);
      sinon.stub(instance, 'pkg').get(() => badVersionPkg);
      sinon.stub(instance, 'pluginsConfig').get(() => config);
      findPortAvailablePort.returns(Promise.resolve(100));
    })
    .test(async (instance) => {
      try {
        await instance.run();
      } catch (e) {
        expect(e).to.be.instanceOf(TwilioCliError);
        expect(e.message).to.contain('versioning is not compatable');
        expect(instance._flags.name).to.be.undefined;
        expect(instance._flags['include-remote']).to.be.undefined;
        expect(instance.runScript).not.to.have.been.called;
        expect(instance.spawnScript).not.to.have.been.called;
      }
    })
    .it('should error due to bad versioning');

  start()
    .setup((instance) => {
      sinon.stub(instance, 'runScript').returnsThis();
      sinon.stub(instance, 'spawnScript').returnsThis();
      sinon.stub(instance, 'isPluginFolder').returns(true);
      sinon.stub(instance, 'pkg').get(() => badPluginsPkg);
      sinon.stub(instance, 'pluginsConfig').get(() => config);
      findPortAvailablePort.returns(Promise.resolve(100));
    })
    .test(async (instance) => {
      try {
        await instance.run();
      } catch (e) {
        expect(e).to.be.instanceOf(TwilioCliError);
        expect(e.message).to.contain('was not found');
        expect(instance._flags.name).to.be.undefined;
        expect(instance._flags['include-remote']).to.be.undefined;
        expect(instance.runScript).not.to.have.been.called;
        expect(instance.spawnScript).not.to.have.been.called;
      }
    })
    .it('should error due to not being in the plugins.json file');

  start(['--name', 'plugin-testOne', '--name', 'plugin-testTwo', '--include-remote'])
    .setup(async (instance) => {
      sinon.stub(instance, 'runScript').returnsThis();
      sinon.stub(instance, 'spawnScript').returnsThis();
      sinon.stub(instance, 'isPluginFolder').returns(false);
      sinon.stub(instance, 'pluginsConfig').get(() => config);
      findPortAvailablePort.returns(Promise.resolve(100));
    })
    .test(async (instance) => {
      await instance.run();

      expect(instance._flags.name.includes('plugin-testOne'));
      expect(instance._flags.name.includes('plugin-testTwo'));
      expect(instance._flags.name.length).to.equal(2);
      expect(instance._flags['include-remote']).to.be.true;
    })
    .it('should read the name and include-remote flags');

  start(['--name', 'plugin-testOne'])
    .setup(async (instance) => {
      sinon.stub(instance, 'runScript').returnsThis();
      sinon.stub(instance, 'spawnScript').returnsThis();
      sinon.stub(instance, 'isPluginFolder').returns(false);
      sinon.stub(instance, 'pluginsConfig').get(() => config);
      findPortAvailablePort.returns(Promise.resolve(100));
    })
    .test(async (instance) => {
      await instance.run();

      expect(instance._flags.name.includes('plugin-testOne'));
      expect(instance._flags.name.length).to.equal(1);
      expect(instance._flags['include-remote']).to.be.undefined;
    })
    .it('should process the one plugin');

  start([''])
    .setup(async (instance) => {
      sinon.stub(instance, 'runScript').returnsThis();
      sinon.stub(instance, 'spawnScript').returnsThis();
      sinon.stub(instance, 'isPluginFolder').returns(false);
      sinon.stub(instance, 'pluginsConfig').get(() => config);
    })
    .test(async (instance) => {
      try {
        await instance.run();
      } catch (e) {
        expect(e).to.be.instanceOf(TwilioCliError);
        expect(e.message).to.contain('not a flex plugin');
        expect(instance._flags.name).to.be.undefined;
        expect(instance._flags['include-remote']).to.be.undefined;
      }
    })
    .it('should throw an error if not in a plugin directory and no plugins given');
});
