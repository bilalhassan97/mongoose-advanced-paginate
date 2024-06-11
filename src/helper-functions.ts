import { Types, isValidObjectId } from 'mongoose';
import {
  FilterElement,
  FilterObject,
  SearchElement,
  SearchObject,
  Selectors,
} from './types';

// const hexadecimal = /^(0x|0h)?[0-9A-F]+$/i;

// const isHexadecimal = (str: string) => {
//   return hexadecimal.test(str);
// };

const isMongoId = (str: string) => {
  return (
    isValidObjectId(str) && str.match(/^[0-9a-fA-F]{24}$/) && str.length === 24
  );
};

export const filterTransform = (
  filterBy: FilterElement[],
  selectors: Selectors,
): object[] => {
  const filters: object[] = [];

  filterBy.forEach((filterElem) => {
    const filterValue = selectors?.[filterElem];
    const filterObj: FilterObject = {};

    if (filterValue) {
      if (typeof filterValue === 'string' && isMongoId(filterValue)) {
        filterObj[filterElem] = new Types.ObjectId(filterValue);
      } else {
        filterObj[filterElem] = filterValue;
      }
    }

    if (
      filterObj[filterElem] !== undefined &&
      filterObj[filterElem] !== null &&
      filterObj[filterElem] !== '' &&
      filterValue !== 'All'
    )
      filters.push(filterObj);
  });
  return filters;
};

export const searchTransform = (
  searchBy: SearchElement[],
  searchText: string,
): object[] => {
  return searchBy.map((searchElem) => {
    const searchObj: SearchObject = {};
    if (isMongoId(searchText)) {
      searchObj[searchElem] = new Types.ObjectId(searchText);
    } else {
      searchObj[searchElem] = {
        $regex: searchText,
        $options: 'i',
      };
    }
    return searchObj;
  });
};

export const isEmptyObject = (obj: object) => {
  return obj === undefined || Object.keys(obj).length === 0;
};
