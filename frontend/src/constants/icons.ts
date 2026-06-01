export const ICON_PATHS: Record<string, string> = {
  temple: 'M12 2l-4 3h8l-4-3zm0 4l-6 4h12l-6-4zm0 5l-8 6h16l-8-6zm-2 6h4v5h-4z',
  waterfall: 'M12 2v16M9 6c-2 0-3 1-3 3v13M15 6c2 0 3 1 3 3v13M12 22v-2',
  beach: 'M12 10a4 4 0 100-8 4 4 0 000 8z M2 17c2 0 3-1 5-1s3 1 5 1 3-1 5-1 3 1 5 1 M2 21c2 0 3-1 5-1s3 1 5 1 3-1 5-1 3 1 5 1',
  mountain: 'M3 20l9-16 9 16H3z M8 11l4-3 4 3',
  hill: 'M2 20c4-6 10-6 14 0 M12 20c4-4 8-4 10 0',
  lake: 'M12 21c-5 0-9-2-9-5s4-5 9-5 9 2 9 5-4 5-9 5z M12 17a3 3 0 110-6 3 3 0 010 6z',
  forest: 'M12 2l3 5H9l3-5zm0 6l4 7H8l4-7zm0 7v5',
  village: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z',
  museum: 'M4 22V10h16v12M2 10l10-8 10 8M9 14v4M15 14v4',
  market: 'M3 3h18v2H3V3zm3 4v14h12V7H6zM10 7v14M14 7v14',
}

export const getIconPath = (iconName?: string) => {
  if (!iconName) return 'M12 2v20M2 12h20'
  return ICON_PATHS[iconName] || iconName
}
