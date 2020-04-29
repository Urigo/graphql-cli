import { cosmiconfig, defaultLoaders } from 'cosmiconfig';

function generateSearchPlaces(moduleName: string) {
  const extensions = ['json', 'yaml', 'yml', 'js', 'config.js'];
  // gives codegen.json...
  const regular = extensions.map((ext) => `${moduleName}.${ext}`);
  // gives .codegenrc.json... but no .codegenrc.config.js
  const dot = extensions.filter((ext) => ext !== 'config.js').map((ext) => `.${moduleName}rc.${ext}`);

  return regular.concat(dot);
}

function customLoader(ext: 'json' | 'yaml' | 'js') {
  function loader(filepath: string, content: string) {
    if (typeof process !== 'undefined' && 'env' in process) {
      content = content.replace(/\$\{(.*?)\}/g, (str, variable, index) => {
        let varName = variable;
        let defaultValue = '';

        if (variable.includes(':')) {
          const spl = variable.split(':');
          varName = spl.shift();
          defaultValue = spl.join(':');
        }

        return process.env[varName] || defaultValue;
      });
    }

    if (ext === 'json') {
      return defaultLoaders['.json'](filepath, content);
    }

    if (ext === 'yaml') {
      return defaultLoaders['.yaml'](filepath, content);
    }

    if (ext === 'js') {
      return defaultLoaders['.js'](filepath, content);
    }
  }

  return loader;
}

export async function searchCodegenConfig(cwd: string) {
  const moduleName = 'codegen';
  const cosmi = cosmiconfig(moduleName, {
    searchPlaces: generateSearchPlaces(moduleName),
    loaders: {
      '.json': customLoader('json'),
      '.yaml': customLoader('yaml'),
      '.yml': customLoader('yaml'),
      '.js': customLoader('js'),
      noExt: customLoader('yaml'),
    },
  });
  return cosmi.search(cwd);
}
