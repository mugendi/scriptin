export function toDate(argument) {
  var argStr = Object.prototype.toString.call(argument);

  // Clone the date
  if (
    argument instanceof Date ||
    (typeof argument === 'object' && argStr === '[object Date]')
  ) {
    // Prevent the date to lose the milliseconds when passed to new Date() in IE10
    return new argument.constructor(+argument);
  } else if (
    typeof argument === 'number' ||
    argStr === '[object Number]' ||
    typeof argument === 'string' ||
    argStr === '[object String]'
  ) {
    // TODO: Can we get rid of as?
    return new Date(argument);
  } else {
    // TODO: Can we get rid of as?
    return new Date(NaN);
  }
}

export function constructFrom(date, value) {
  if (date instanceof Date) {
    return new date.constructor(value);
  } else {
    return new Date(value);
  }
}

export function addMilliseconds(date, amount) {
  var timestamp = +toDate(date);
  return constructFrom(date, timestamp + amount);
}

export function addSeconds(date, amount) {
  return addMilliseconds(date, amount * 1000);
}

export function isBefore(date, dateToCompare) {
  var _date = toDate(date);
  var _dateToCompare = toDate(dateToCompare);
  return +_date < +_dateToCompare;
}
