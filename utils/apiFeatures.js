/* eslint-disable node/no-unsupported-features/es-syntax */
class ApiFeatures {
  constructor(query, queryString) {
    this.query = query
    this.queryString = queryString
  }

  filter() {
    //First Build the query
    const excludedFields = ["skip", "limit", "sort", "fields"]
    const queryObj = { ...this.queryString }
    excludedFields.forEach(el => delete queryObj[el])
    console.log("queryObj", queryObj)
    //Advance filtering
    let queryStr = JSON.stringify(queryObj)
    queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, match => `$${match}`)
    queryStr = JSON.parse(queryStr)
    console.log("queryStr", queryStr)
    this.query.find(queryStr)
    return this
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ")
      console.log("sortBy", sortBy)
      this.query = this.query.sort(sortBy)
    }
    return this
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ")
      console.log("fields", fields)
      this.query = this.query.select(fields)
    } else {
      this.query = this.query.select("-__v")
    }
    return this
  }

  paginate() {
    if (this.queryString.skip && this.queryString.limit) {
      this.query = this.query
        .skip(this.queryString.skip)
        .limit(this.queryString.limit)
    }
    return this
  }
}

module.exports = ApiFeatures
