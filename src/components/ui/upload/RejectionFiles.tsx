import { type FileRejection } from "react-dropzone";
// utils
import { fData } from "@/lib/formatNumber";
import { Alert } from "../alert";
// ----------------------------------------------------------------------

interface RejectionFilesProps {
  fileRejections: FileRejection[];
}

export default function RejectionFiles({
  fileRejections,
}: RejectionFilesProps) {
  return (
    <Alert variant="destructive" className="max-w-sm">
      {fileRejections.map(({ file, errors }) => {
        const { webkitRelativePath, size } = file;

        return (
          <div key={webkitRelativePath}>
            <p className="text-sm">
              {webkitRelativePath} - {fData(size)}
            </p>

            {errors.map((error) => (
              <p className="text-sm" key={error.code}>
                - {error.message}
              </p>
            ))}
          </div>
        );
      })}
    </Alert>
  );
}
