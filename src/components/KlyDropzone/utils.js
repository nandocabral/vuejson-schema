function whereStruct(params, operator = "=", collate = false) {
  return Object.keys(params).reduce((acc, item) => {
    acc.push({
      ...{
        field: item,
        operator: operator,
        value: params[item]
      },
      ...(collate ? { collate: collate } : {})
    });
    return acc;
  }, []);
}

function whereInStruct(params) {
  return Object.keys(params).reduce((acc, item) => {
    acc.push({
      field: item,
      value: params[item]
    });
    return acc;
  }, []);
}

function isImageMime(type) {
  let mimes = [
    "image/webp",
    "image/gif",
    "image/jpeg",
    "image/png",
    "image/svg+xml"
  ];
  return mimes.indexOf(type) > -1;
}

function isImageExt(file) {
  let exts = [".svg", ".png", ".jpg", ".jpeg", ".gif", ".webp"];
  for (let i in exts) {
    if (file.indexOf(exts[i]) > -1) {
      return true;
    }
  }
  return false;
}

export { whereStruct, whereInStruct, isImageMime, isImageExt };
