# mongoose-advanced-paginate
## The best pagination plugin you will ever need with mongoose

### Supports searching, sorting, filtering with mongodb aggregate

### Installation
```
npm install mongoose-advanced-paginate
yarn add mongoose-advanced-paginate
pnpm install mongoose-advanced-paginate
```

### Basic Example with nestjs and mongoose

#### Model File

```
import { paginatePlugin } from 'mongoose-advanced-paginate';

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ required: true })
  name: string;
}
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.plugin(paginatePlugin);
```
#### Service Class
```
import {
  PaginateModel,
  PaginationOptions,
  PaginationResult,
  SortOrderDirection,
} from 'mongoose-advanced-paginate';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: PaginateModel<User> & SoftDeleteModel<User>,
  ) {}

  async find(
    page?: number,
    limit?: number,
    sortOrder?: SortOrderDirection,
    sortBy?: string,
    searchText?: string,
  ): Promise<PaginationResult<User>> {
    const searchBy: string[] = ['name'];

    const options: PaginationOptions = { page, limit };
    const query = {};
    if (sortOrder && sortBy) {
      options['sortOrder'] = { id: sortBy, direction: sortOrder };
    } else {
      options['sortOrder'] = {
        id: 'createdAt',
        direction: SortOrderDirection.DESC,
      };
    }
    if (searchBy?.length && searchText) {
      options['search'] = {
        searchText,
        searchBy,
      };
    }
    options['extraStages'] = [
      {
        $lookup: {
           ...
      },
      },
    ];
    options['project'] = {
        name: 1
         ...
    }
    const results = await this.userModel.paginate(query, options);
    return results;
  }
}
```

## License

MIT

**Free Software, Hell Yeah!**
