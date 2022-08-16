/* eslint-disable node/no-unsupported-features/es-syntax */
const catchAsync = require("../utils/catchAsync")
const AppError = require("../utils/appError")
const ApiFeatures = require("../utils/apiFeatures")

exports.getAll = (Model, responseKey) =>
  catchAsync(async (req, res, next) => {
    const filter = {}
    if (req.params.tourId) filter.tour = req.params.tourId //HACK For Reviews

    const features = new ApiFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate()
    // const doc = await features.query.explain()
    const doc = await features.query
    if (!doc) return next(new AppError("Something went wrong", 500))
    res.status(200).json({
      status: "success",
      data: {
        requestedAt: req.requestTime,
        resultLength: doc.length,
        [responseKey]: doc,
        message: `${responseKey} fetched successfully`,
      },
    })
  })

exports.getOne = (Model, responseKey, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id)
    if (populateOptions) query = query.populate(populateOptions)
    const doc = await query
    if (!doc)
      return next(
        new AppError(`Document with ID: ${req.params.id} is not found`, 404)
      )
    res.status(201).json({
      status: "success",
      data: {
        message: `${responseKey} fetched successfully`,
        [responseKey]: doc,
      },
    })
  })

exports.createOne = (Model, responseKey) =>
  catchAsync(async (req, res) => {
    const doc = await Model.create(req.body)
    res.status(201).json({
      status: "success",
      data: {
        message: `${responseKey} created successfully`,
        [responseKey]: doc,
      },
    })
  })

exports.updateOne = (Model, responseKey) =>
  catchAsync(async (req, res, next) => {
    if(req.body.id)
      delete req.body.id
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!doc)
      return next(
        new AppError(`Document with ID: ${req.params.id} is not found`, 404)
      )
    res.status(200).json({
      status: "success",
      data: {
        message: `${responseKey} updated successfully`,
        [responseKey]: doc,
      },
    })
  })

exports.deleteOne = (Model, responseKey) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id)
    if (!doc)
      return next(
        new AppError(`Document with ID: ${req.params.id} is not found`, 404)
      )
    res.status(204).json({
      status: "success",
      data: {
        message: `${responseKey} deleted successfully`,
        [responseKey]: doc,
      },
    })
  })
