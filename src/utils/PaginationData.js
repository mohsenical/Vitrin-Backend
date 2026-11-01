createPaginationData = ( page, limit, totalCount, resourceName ) => ({
    limit,
    page,
    totalPage: Math.ceil(totalCount / limit),
    [`total${resourceName}`]: totalCount ,
})

module.exports = {createPaginationData}