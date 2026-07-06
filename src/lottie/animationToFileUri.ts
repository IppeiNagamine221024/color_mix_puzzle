import { File, Paths } from 'expo-file-system';

/**
 * Lottie JSON をキャッシュディレクトリの実ファイルに書き出し、
 * lottie-react-native の { uri } 読み込み用パスを返す。
 * iOS で JSON オブジェクト経由だと直前の enter が残る事象の回避用。
 */
export function animationToFileUri(animation: object, fileName: string): string {
  const json = JSON.stringify(animation);
  const file = new File(Paths.cache, fileName);
  if (file.exists) {
    file.delete();
  }
  file.create({ overwrite: true });
  file.write(json);
  return file.uri;
}
