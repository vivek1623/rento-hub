const filterObjectData = (obj, ...allowedFields) => {
  const filteredObj = {}
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) filteredObj[el] = obj[el]
  })
  return filteredObj
}

module.exports = filterObjectData
