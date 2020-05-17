'use strict';

import { Model } from 'fire-models/Model';

class LandmarkModel extends Model {
  constructor() {
    super('landmarks', true, null);
    this.schema = null;
  }

  async findMuseums(db) {
    const wheres = [['type', '==', 'museum']];
    return await this.find(db, wheres);
  }
}

export const landmarkModel = new LandmarkModel();
