# mongoose-advanced-paginate

## The best pagination plugin you will ever need with mongoose

### Supports searching, sorting, filtering with mongodb aggregate

## Installation

To install the library, use the following npm command:

`npm install mongoose-advanced-paginate`

## Usage

### Plugin Integration

#### NestJS (TypeScript)

To use the pagination plugin in a NestJS application, follow the steps below:

1.  **Install Dependencies**: Ensure you have `mongoose` and `@nestjs/mongoose` installed.

    `npm install mongoose @nestjs/mongoose mongoose-advanced-paginate`

2.  **Create Mongoose Schema**: Define your Mongoose schema and apply the pagination plugin.

    ```typescript
    import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
    import { PaginateModel, paginatePlugin } from 'mongoose-advanced-paginate';

    @Schema({
      timestamps: true,
    })
    export class User {
      @Prop({ required: true })
      name: string;

      @Prop()
      email: string;
    }

    export const UserSchema = SchemaFactory.createForClass(User);
    UserSchema.plugin(paginatePlugin);

    export type UserModel = PaginateModel<User>;
    ```

3.  **Service Implementation**: Use the paginate method in your service.

    ```typescript
    import { Injectable } from '@nestjs/common';
    import { InjectModel } from '@nestjs/mongoose';
    import { Model } from 'mongoose';
    import { User, UserModel } from './user.schema';
    import { PaginationOptions, PaginationResult, SortOrderDirection } from 'mongoose-advanced-paginate';

    @Injectable()
    export class UserService {
      constructor(@InjectModel(User.name) private userModel: UserModel) {}

      async find(
        page: number,
        limit: number,
        searchText?: string,
      ): Promise<PaginationResult<User>> {
        const searchBy = ['name', 'email'];

        const options: PaginationOptions = { page, limit };
        const query = { anyFilter: 'anyFilterValue' };

        options.sortOrder = {
          id: 'createdAt',
          direction: SortOrderDirection.DESC,
        };

        if (searchText) {
          options.search = {
            searchText,
            searchBy,
          };
        }

        options.project = {
          name: 1,
          email: 1,
          createdAt: 1,
        };

        const results = await this.userModel.paginate(query, options);
        return results;
      }
    }
    ```

#### Express.js (JavaScript)

To use the pagination plugin in an Express.js application, follow the steps below:

1.  **Install Dependencies**: Ensure you have `mongoose` installed.

    `npm install mongoose mongoose-advanced-paginate`

2.  **Create Mongoose Schema**: Define your Mongoose schema and apply the pagination plugin.

    ```typescript
    const mongoose = require('mongoose');
    const { paginatePlugin } = require('mongoose-advanced-paginate');

    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      isNew: Boolean
    });

    userSchema.plugin(paginatePlugin);

    const User = mongoose.model('User', userSchema);

    module.exports = User;
    ```

3.  **Controller Implementation**: Handle requests in your Express controller.

    ```typescript
    const express = require('express');
    const User = require('./user.model'); // Adjust the path to your model file
    const router = express.Router();

    router.get('/users', async (req, res) => {
      const { page = 1, limit = 10, search = '' } = req.query;
      // You can add any filters here
      const query = { isNew: true };
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sortOrder: { id: 'createdAt', direction: 'desc' },
        search: { searchText: search, searchBy: ['name', 'email'] },
      };

      try {
        const result = await User.paginate(query, options);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    module.exports = router;
    ```

### Advanced Example With Filters and Selectors (NestJS)

```typescript
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModel } from './user.schema';
import { PaginationOptions, PaginationResult } from 'mongoose-advanced-paginate';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: UserModel) {}

  async find(
    page: number,
    limit: number,
  ): Promise<PaginationResult<User>> {
    const options: PaginationOptions = { page, limit };

    const query = {isNew:true}

    options.filter = {
      selectors: {
        'company.type': 'freelance', // Adjust this to your actual enum
        isNew: true,
      },
      filterBy: ['company.type', 'isNew'],
    };

    options.customFilters = [
      // Add companies in the customFilters instead of extraStages
      // so that filtering can be applied on company type in this example
      {
        $lookup: {
          from: 'companies',
          localField: 'company',
          foreignField: '_id',
          as: 'company',
          pipeline: [
            {
              $project: {
                type: 1,
              },
            },
            {
              $limit: 1,
            },
          ],
        },
      },
      { $unwind: { path: '$company' } },
    ];

    options.extraStages = [
      // Any aggregation stages which don't affect the pagination/total records, you should put them here
    ];

    options.project = {
      name: 1,
      email: 1,
      company: 1,
    };

    return await this.userModel.paginate(query, options);
  }
}
```

### Pagination Options

The `paginate` method accepts the following options:

- **page**: The page number to retrieve (default: 1).
- **limit**: The number of documents per page.
- **sortOrder**: The sorting criteria, which includes:
  - `id`: The field to sort by.
  - `direction`: The direction of sorting (`asc` for ascending, `desc` for descending).
- **customFilters**: An array of custom MongoDB aggregation pipeline stages to apply before pagination. These affect the total count. Be careful to add only those stages which affect the pagination/total count otherwise, these will affect the performance of your query.
- **filter**: An object to specify filtering criteria:
  - `selectors`: An object where keys are field names and values are filter values.
  - `filterBy`: An array of field names to apply filters on.
- **search**: An object to specify search criteria:
  - `searchText`: The text to search for.
  - `searchBy`: An array of field names to search in.
- **lookups**: (Deprecated) An array of MongoDB lookup pipeline stages. Here you can add any lookup stages from the aggregation pipeline which don't affect the total count.
- **extraStages**: An array of additional MongoDB aggregation pipeline stages to apply after pagination. Here you can pass any stages from the aggregation pipeline which shouldn't affect the total count.
- **project**: A MongoDB projection object to specify which fields to include or exclude in the result.

### Pagination Result

The `paginate` method returns a promise that resolves to a `PaginationResult` object. The result includes the following properties:

- **total**: The total number of documents matching the query.
- **page**: The current page number.
- **limit**: The number of documents per page.
- **records**: An array of documents for the current page.
