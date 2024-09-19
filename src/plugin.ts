import { PipelineStage, Schema } from 'mongoose';
import {
  FacetPipelineStage,
  PaginationOptions,
  PaginationResult,
  PaginateQuery,
  SortOrderDirection,
} from './types';
import {
  filterTransform,
  isEmptyObject,
  searchTransform,
} from './helper-functions';

export const paginatePlugin = <T>(schema: Schema<T>): void => {
  schema.statics.paginate = async function (
    query: PaginateQuery,
    options: PaginationOptions,
  ): Promise<PaginationResult<T>> {
    const page = options.page || 1;
    const limit = options.limit;

    const filterPipeline: FacetPipelineStage[] = [];

    if (!isEmptyObject(query)) {
      filterPipeline.push({ $match: query });
    }
    options.customFilters && filterPipeline.push(...options.customFilters);
    if (
      options.filter?.filterBy?.length &&
      !isEmptyObject(options.filter?.selectors)
    ) {
      const filters = filterTransform(
        options.filter?.filterBy,
        options.filter?.selectors,
      );
      filters.length &&
        filterPipeline.push({
          $match: {
            $and: filters,
          },
        });
    }

    options.search?.searchBy?.length &&
      options.search?.searchText !== undefined &&
      options.search?.searchText !== '' &&
      filterPipeline.push({
        $match: {
          $or: searchTransform(
            options.search?.searchBy,
            options.search?.searchText,
          ),
        },
      });

    const countPipeline: FacetPipelineStage[] = [
      ...filterPipeline,
      { $count: 'total' },
    ];

    const recordsPipeline: FacetPipelineStage[] = [...filterPipeline];

    options.lookups && recordsPipeline.push(...options.lookups);

    if (options.sortOrder?.id) {
      recordsPipeline.push({
        $sort: {
          [options.sortOrder?.id]:
            options.sortOrder.direction === SortOrderDirection.ASC ? 1 : -1,
        },
      });
    }

    options.extraStages && recordsPipeline.push(...options.extraStages);

    if (limit) {
      const skip = (page - 1) * limit;
      recordsPipeline.push({ $skip: skip });
      recordsPipeline.push({ $limit: limit });
    }

    options.project && recordsPipeline.push({ $project: options.project });

    const aggregationPipeline: PipelineStage[] = [
      {
        $facet: {
          total: countPipeline,
          records: recordsPipeline,
        },
      },
    ];

    const [aggregationResult] = await this.aggregate(
      aggregationPipeline,
      options.aggregateOptions,
    );

    const total = aggregationResult?.total[0]?.total || 0;
    const records = aggregationResult?.records || [];

    return {
      total,
      page,
      limit,
      records,
    };
  };
};
