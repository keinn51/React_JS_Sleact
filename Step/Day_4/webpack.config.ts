import path from 'path';
// import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import webpack from 'webpack';
// import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
// import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

// production 이면 배포용이고 아니면 개발용이다. (mode에 따라서 달라진다.)
const isDevelopment = process.env.NODE_ENV !== 'production';

// 타입스크립트는 자바스크립트에 타입만 적어주는 친구다. 
// 아래는 config 라는 변수가 webpack.Configuration 이라는 
// 타입이라는 것을 알려주는 것이다.
const config: webpack.Configuration = {
  name: 'sleact',
  mode: isDevelopment ? 'development' : 'production',
  devtool: !isDevelopment ? 'hidden-source-map' : 'eval',
  resolve: {
		// 바벨이 처리할 확장자 목록
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@hooks': path.resolve(__dirname, 'hooks'), // .../.. 이런거 없애준다.
      '@components': path.resolve(__dirname, 'components'),
      '@layouts': path.resolve(__dirname, 'layouts'),
      '@pages': path.resolve(__dirname, 'pages'),
      '@utils': path.resolve(__dirname, 'utils'),
      '@typings': path.resolve(__dirname, 'typings'),
    },
  },
  entry: {
    app: './client',  // client.tsx 가 메인 타입스크립트가 될 것이다.
  },
  module: {
    rules: [
      {
				// ts, tsx 를 바벨로더가 자바스크립트로 바꾸어준다.
        test: /\.tsx?$/,
        loader: 'babel-loader',
        options: {
          presets: [  //바꿔줄 때의 바벨의 설정을 말한다. 세 가지 프리셋 모두 필요!
            [
              '@babel/preset-env',
              {  //크롬의 최신 두 가지 버전을 대상으로 바꾸어준다.
								// preset-env 가 매우 유용한 것! 
								// 내가 어떤 버젼으로 만들든지 돌아가게 바꾸어준다.
                targets: { browsers: ['last 2 chrome versions'] },
                debug: isDevelopment,
              },
            ],
            '@babel/preset-react',
            '@babel/preset-typescript',
          ],
          env: {
            development: {
              plugins: [['@emotion', { sourceMap: true }], require.resolve('react-refresh/babel')],
            },
            production: {
              plugins: ['@emotion'],
            },
          },
        },
        exclude: path.join(__dirname, 'node_modules'),
      },
      {  //css 파일을 JS 파일로 만들어주는 신기한 로더들...
        test: /\.css?$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    // new ForkTsCheckerWebpackPlugin({
    //   async: false,
    //   eslint: {
    //     files: "./src/**/*",
    //   },
    // }),
		// NODE_ENV 는 프론트에서 접근할 수 없는데, EnvironmentPlugin 이 접근하게 해줌
    new webpack.EnvironmentPlugin({ NODE_ENV: isDevelopment ? 'development' : 'production' }),
  ],
  output: {  //dist 라는 폴더 안에, 위에서 entry:app 에 설정해준 파일들을 만들어 넣어준다.
						// 약간 Makefile 같은데..? (여러개의 app 설정 가능)
    path: path.join(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/dist/',
  },
  // devServer: {
  //   historyApiFallback: true, // react router
  //   port: 3090,
  //   publicPath: '/dist/',
  //   proxy: {
  //     '/api/': {
  //       target: 'http://localhost:3095',
  //       changeOrigin: true,
  //     },
  //   },
  // },
};
// 개발환경일 때의 플러그인과 아닐 때의 플러그인
if (isDevelopment && config.plugins) {
  // config.plugins.push(new webpack.HotModuleReplacementPlugin());
  // config.plugins.push(new ReactRefreshWebpackPlugin());
  // config.plugins.push(new BundleAnalyzerPlugin({ analyzerMode: 'server', openAnalyzer: true }));
}
if (!isDevelopment && config.plugins) {
  // config.plugins.push(new webpack.LoaderOptionsPlugin({ minimize: true }));
  // config.plugins.push(new BundleAnalyzerPlugin({ analyzerMode: 'static' }));
}

export default config;
