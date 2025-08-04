import {
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FilePdfOutlined,
  FileOutlined,
} from '@ant-design/icons-vue'

export const getIconComponent = (fileName) => {
  if (!fileName) return FileOutlined

  const ext = fileName.split('.').pop().toLowerCase()

  switch (ext) {
    case 'doc':
    case 'docx':
    case 'wps':
    case 'wpt':
      return FileWordOutlined
    case 'xls':
    case 'xlsx':
    case 'et':
    case 'ett':
      return FileExcelOutlined
    case 'ppt':
    case 'pptx':
    case 'dps':
    case 'dpt':
      return FilePptOutlined
    case 'pdf':
      return FilePdfOutlined
    default:
      return FileOutlined
  }
}
