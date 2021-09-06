import DownloadRow from "../atoms/DownloadRow";
import yaml from 'js-yaml';
import styled from "styled-components";
import {useConfigContext} from "../context/ConfigContext";
import {Dispatch, SetStateAction} from "react";

const DownloadsContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

type Props = {
    setPreview: Dispatch<SetStateAction<string>>
};

type DownloadObj = {
    fileName: string,
    extension: string,
    content: string,
    preview?: string,
};

type DownloadArr = Array<DownloadObj>;

const Downloads = ({setPreview}: Props) => {
    let downloads: DownloadArr = [];
    const configContext = useConfigContext();
    if(!configContext) return null;

    const {configInput, results} = configContext;

    if (results?.demo) {
        downloads.push({
                fileName: 'raw',
                extension: 'txt',
                content: configInput
            }, {
                fileName: 'canonical',
                extension: 'yaml',
                content: yaml.dump(results.points)
            },
            {
                fileName: 'demo',
                extension: 'dxf',
                content: results?.demo?.dxf,
                preview: "demo.svg"
            },
            {
                fileName: 'points',
                extension: 'yaml',
                content: yaml.dump(results.points)
            },
            {
                fileName: 'units',
                extension: 'yaml',
                content: yaml.dump(results.units)
            });
    }

    if (results?.outlines) {
        for (const [name, outline] of Object.entries(results.outlines)) {
            downloads.push(
                {
                    fileName: name,
                    extension: 'dxf',
                    // @ts-ignore
                    content: outline.dxf,
                    preview: `outlines.${name}.svg`
                }
            )
        }

    }

    if (results?.cases) {
        for (const [name, caseObj] of Object.entries(results.cases)) {
            downloads.push(
                {
                    fileName: name,
                    extension: 'stl',
                    // @ts-ignore
                    content: caseObj.stl,
                    preview: `cases.${name}.jscad`
                }
            )
        }

    }

    if (results?.pcbs) {
        for (const [name, pcb] of Object.entries(results.pcbs)) {
            downloads.push(
                {
                    fileName: name,
                    extension: 'kicad_pcb',
                    // @ts-ignore
                    content: pcb
                }
            )
        }

    }



    return (
      <DownloadsContainer>
          <h3>Downloads</h3>
          {
              downloads.map((download, i)=><DownloadRow key={i} {...download} setPreview={setPreview}/>)
          }
      </DownloadsContainer>
  );
};

      export default Downloads;