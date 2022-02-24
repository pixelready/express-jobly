const { BadRequestError } = require( "../expressError" );

/**
 * Accepts an object with column names as keys, and values to update, converts
 * any camelCase keys to their equivalent snake case DB column names and
 * returns an array of column names and parameter tokens for insertion into a SQL
 * query
 * @param {object} dataToUpdate - Object like `{columnName: valueToUpdate}`
 * @returns Object containing arrays of: column names and parameter tokens 
 * like: `['"col_name"=$1']` and values
 */

function sqlForPartialUpdate( dataToUpdate, jsToSql ) {
  const keys = Object.keys( dataToUpdate );
  if ( keys.length === 0 )
    throw new BadRequestError( "No data" );

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map( ( colName, idx ) => `"${jsToSql[colName] || colName}"=$${idx + 1}` );

  return { setCols: cols.join( ", " ), values: Object.values( dataToUpdate ) };
};

/**
 * Accepts an object with filters like { name : 'C1',... }, and returns an object 
 * containing an array of parameter tokens and and an array of values for insertion
 * into a SQL query
 * @param {object} dataToUpdate - Object like `{name: filterValue}`
 * @returns Object with arrays of parameter tokens like `$1` and corresponding values
 */
function sqlForFilter( filters ) {
  const keys = Object.keys( filters );

  const placeHolders = keys.map( ( value, idx ) => `$${idx + 1}` );

  return { placeHolders: placeHolders, values: Object.values( filters ) };
};

module.exports = {
  sqlForPartialUpdate,
  sqlForFilter
};
