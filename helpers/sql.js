const { BadRequestError } = require( '../expressError' );

/**
 * Accepts an object with column names as keys, and values to update, converts
 * any camelCase keys to their equivalent snake case DB column names and
 * returns an array of column names and parameter tokens for insertion into a SQL
 * query
 * @param {object} dataToUpdate - Object like `{columnName: valueToUpdate}`
 * @returns Array of column names and parameter tokens like `['"col_name"=$1']`
 */

function sqlForPartialUpdate( dataToUpdate, jsToSql ) {
  const keys = Object.keys( dataToUpdate );
  if ( keys.length === 0 )
    throw new BadRequestError( 'No data' );

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map( ( colName, idx ) => `"${jsToSql[colName] || colName}"=$${idx + 1}` );

  return { setCols: cols.join( ', ' ), values: Object.values( dataToUpdate ) };
}

function sqlForFilter( filters ) {
  const keys = Object.keys( filters );
  if ( keys.length === 0 )
    throw new BadRequestError( 'No data' );


  const placeHolders = keys.map( ( idx ) => `$${idx + 1}` );

  return { placeHolders: placeHolders ,values: Object.values( filters )};
}





module.exports = {
  sqlForPartialUpdate,
  sqlForFilter
};
