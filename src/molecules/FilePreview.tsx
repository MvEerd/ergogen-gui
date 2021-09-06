import SvgPreview from "../atoms/SvgPreview";
import JscadPreview from "../atoms/JscadPreview";

type Props = {
    previewKey: string,
    previewContent: string,
    width?: number | string,
    height?: number | string,
    className?: string
};

const FilePreview = ({previewKey, previewContent, width = '100%', height = '100%', className}: Props) => {
    const previewExt = previewKey.split(".").slice(-1)[0];

    const renderFilePreview = (previewExt: string) => {
        switch (previewExt) {
            case 'svg':
                return (
                    <SvgPreview svg={previewContent} width={width} height={height}/>
                )
            case 'jscad':
                return (
                    <JscadPreview previewContent={previewContent}/>
                )
            default:
                return <></>;
        }
    };

    return (
        <div className={className}>
            {renderFilePreview(previewExt)}
        </div>
    );
}

export default FilePreview;