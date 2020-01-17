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

export { whereStruct, whereInStruct };
