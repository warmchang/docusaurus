/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as path from 'path';
import {
  type AuthorsMap,
  getAuthorsMap,
  getBlogPostAuthors,
  validateAuthorsMap,
} from '../authors';

describe('getBlogPostAuthors', () => {
  it('can read no authors', () => {
    expect(
      getBlogPostAuthors({
        frontMatter: {},
        authorsMap: undefined,
        baseUrl: '/',
      }),
    ).toEqual([]);
    expect(
      getBlogPostAuthors({
        frontMatter: {
          authors: [],
        },
        authorsMap: undefined,
        baseUrl: '/',
      }),
    ).toEqual([]);
  });

  it('can read author from legacy front matter', () => {
    expect(
      getBlogPostAuthors({
        frontMatter: {
          author: 'Sébastien Lorber',
        },
        authorsMap: undefined,
        baseUrl: '/',
      }),
    ).toEqual([{name: 'Sébastien Lorber'}]);
    expect(
      getBlogPostAuthors({
        frontMatter: {
          authorTitle: 'maintainer',
        },
        authorsMap: undefined,
        baseUrl: '/',
      }),
    ).toEqual([{title: 'maintainer'}]);
    expect(
      getBlogPostAuthors({
        frontMatter: {
          authorImageURL: 'https://github.com/slorber.png',
        },
        authorsMap: undefined,
        baseUrl: '/',
      }),
    ).toEqual([{imageURL: 'https://github.com/slorber.png'}]);
    expect(
      getBlogPostAuthors({
        frontMatter: {
          authorImageURL: '/img/slorber.png',
        },
        authorsMap: undefined,
        baseUrl: '/',
      }),
    ).toEqual([{imageURL: '/img/slorber.png'}]);
    expect(
      getBlogPostAuthors({
        frontMatter: {
          authorImageURL: '/img/slorber.png',
        },
        authorsMap: undefined,
        baseUrl: '/baseURL',
      }),
    ).toEqual([{imageURL: '/baseURL/img/slorber.png'}]);
    expect(
      getBlogPostAuthors({
        frontMatter: {
          author: 'Sébastien Lorber',
          author_title: 'maintainer1',
          authorTitle: 'maintainer2',
          author_image_url: 'https://github.com/slorber1.png',
          authorImageURL: 'https://github.com/slorber2.png',
          author_url: 'https://github.com/slorber1',
          authorURL: 'https://github.com/slorber2',
        },
        authorsMap: undefined,
        baseUrl: '/',
      }),
    ).toEqual([
      {
        name: 'Sébastien Lorber',
        title: 'maintainer1',
        imageURL: 'https://github.com/slorber1.png',
        url: 'https://github.com/slorber1',
      },
    ]);
  });

  it('can read authors string', () => {
    expect(
      getBlogPostAuthors({
        frontMatter: {
          authors: 'slorber',
        },
        authorsMap: {slorber: {name: 'Sébastien Lorber'}},
        baseUrl: '/',
      }),
    ).toEqual([{key: 'slorber', name: 'Sébastien Lorber'}]);
    expect(
      getBlogPostAuthors({
        frontMatter: {
          authors: 'slorber',
        },
        authorsMap: {
          slorber: {
            name: 'Sébastien Lorber',
            imageURL: 'https://github.com/slorber.png',
          },
        },
        baseUrl: '/',
      }),
    ).toEqual([
      {
        key: 'slorber',
        name: 'Sébastien Lorber',
        imageURL: 'https://github.com/slorber.png',
      },
    ]);
    expect(
      getBlogPostAuthors({
        frontMatter: {
          authors: 'slorber',
        },
        authorsMap: {
          slorber: {
            name: 'Sébastien Lorber',
            imageURL: '/img/slorber.png',
          },
        },
        baseUrl: '/',
      }),
    ).toEqual([
      {
        key: 'slorber',
        name: 'Sébastien Lorber',
        imageURL: '/img/slorber.png',
      },
    ]);
    expect(
      getBlogPostAuthors({
        frontMatter: {
          authors: 'slorber',
        },
        authorsMap: {
          slorber: {
            name: 'Sébastien Lorber',
            imageURL: '/img/slorber.png',
          },
        },
        baseUrl: '/baseUrl',
      }),
    ).toEqual([
      {
        key: 'slorber',
        name: 'Sébastien Lorber',
        imageURL: '/baseUrl/img/slorber.png',
      },
    ]);
  });

  it('can read authors string[]', () => {
    expect(
      getBlogPostAuthors({
        frontMatter: {
          authors: ['slorber', 'yangshun'],
        },
        authorsMap: {
          slorber: {name: 'Sébastien Lorber', title: 'maintainer'},
          yangshun: {name: 'Yangshun Tay'},
        },
        baseUrl: '/',
      }),
    ).toEqual([
      {key: 'slorber', name: 'Sébastien Lorber', title: 'maintainer'},
      {key: 'yangshun', name: 'Yangshun Tay'},
    ]);
  });

  it('can read authors Author', () => {
    expect(
      getBlogPostAuthors({
        frontMatter: {
          authors: {name: 'Sébastien Lorber', title: 'maintainer'},
        },
        authorsMap: undefined,
        baseUrl: '/',
      }),
    ).toEqual([{name: 'Sébastien Lorber', title: 'maintainer'}]);
  });

  it('can read authors Author[]', () => {
    expect(
      getBlogPostAuthors({
        frontMatter: {
          authors: [
            {name: 'Sébastien Lorber', title: 'maintainer'},
            {name: 'Yangshun Tay'},
          ],
        },
        authorsMap: undefined,
        baseUrl: '/',
      }),
    ).toEqual([
      {name: 'Sébastien Lorber', title: 'maintainer'},
      {name: 'Yangshun Tay'},
    ]);
  });

  it('can read authors complex (string | Author)[] setup with keys and local overrides', () => {
    expect(
      getBlogPostAuthors({
        frontMatter: {
          authors: [
            'slorber',
            {
              key: 'yangshun',
              title: 'Yangshun title local override',
              extra: 42,
            },
            {name: 'Alexey'},
          ],
        },
        authorsMap: {
          slorber: {name: 'Sébastien Lorber', title: 'maintainer'},
          yangshun: {name: 'Yangshun Tay', title: 'Yangshun title original'},
        },
        baseUrl: '/',
      }),
    ).toEqual([
      {key: 'slorber', name: 'Sébastien Lorber', title: 'maintainer'},
      {
        key: 'yangshun',
        name: 'Yangshun Tay',
        title: 'Yangshun title local override',
        extra: 42,
      },
      {name: 'Alexey'},
    ]);
  });

  it('can normalize inline authors', () => {
    expect(
      getBlogPostAuthors({
        frontMatter: {
          authors: [
            {
              name: 'Seb1',
              socials: {
                x: 'https://x.com/sebastienlorber',
                twitter: 'sebastienlorber',
                github: 'slorber',
              },
            },
            {
              name: 'Seb2',
              socials: {
                x: 'sebastienlorber',
                twitter: 'https://twitter.com/sebastienlorber',
                github: 'https://github.com/slorber',
              },
            },
          ],
        },
        authorsMap: {},
        baseUrl: '/',
      }),
    ).toEqual([
      {
        name: 'Seb1',
        socials: {
          x: 'https://x.com/sebastienlorber',
          twitter: 'https://twitter.com/sebastienlorber',
          github: 'https://github.com/slorber',
        },
      },
      {
        name: 'Seb2',
        socials: {
          x: 'https://x.com/sebastienlorber',
          twitter: 'https://twitter.com/sebastienlorber',
          github: 'https://github.com/slorber',
        },
      },
    ]);
  });

  it('throw when using author key with no authorsMap', () => {
    expect(() =>
      getBlogPostAuthors({
        frontMatter: {
          authors: 'slorber',
        },
        authorsMap: undefined,
        baseUrl: '/',
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      "Can't reference blog post authors by a key (such as 'slorber') because no authors map file could be loaded.
      Please double-check your blog plugin config (in particular 'authorsMapPath'), ensure the file exists at the configured path, is not empty, and is valid!"
    `);
  });

  it('throw when using author key with empty authorsMap', () => {
    expect(() =>
      getBlogPostAuthors({
        frontMatter: {
          authors: 'slorber',
        },
        authorsMap: {},
        baseUrl: '/',
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      "Can't reference blog post authors by a key (such as 'slorber') because no authors map file could be loaded.
      Please double-check your blog plugin config (in particular 'authorsMapPath'), ensure the file exists at the configured path, is not empty, and is valid!"
    `);
  });

  it('throw when using bad author key in string', () => {
    expect(() =>
      getBlogPostAuthors({
        frontMatter: {
          authors: 'slorber',
        },

        authorsMap: {
          yangshun: {name: 'Yangshun Tay'},
          jmarcey: {name: 'Joel Marcey'},
        },
        baseUrl: '/',
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      "Blog author with key "slorber" not found in the authors map file.
      Valid author keys are:
      - yangshun
      - jmarcey"
    `);
  });

  it('throw when using bad author key in string[]', () => {
    expect(() =>
      getBlogPostAuthors({
        frontMatter: {
          authors: ['yangshun', 'jmarcey', 'slorber'],
        },

        authorsMap: {
          yangshun: {name: 'Yangshun Tay'},
          jmarcey: {name: 'Joel Marcey'},
        },
        baseUrl: '/',
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      "Blog author with key "slorber" not found in the authors map file.
      Valid author keys are:
      - yangshun
      - jmarcey"
    `);
  });

  it('throw when using bad author key in Author[].key', () => {
    expect(() =>
      getBlogPostAuthors({
        frontMatter: {
          authors: [{key: 'yangshun'}, {key: 'jmarcey'}, {key: 'slorber'}],
        },

        authorsMap: {
          yangshun: {name: 'Yangshun Tay'},
          jmarcey: {name: 'Joel Marcey'},
        },
        baseUrl: '/',
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      "Blog author with key "slorber" not found in the authors map file.
      Valid author keys are:
      - yangshun
      - jmarcey"
    `);
  });

  it('throw when mixing legacy/new authors front matter', () => {
    expect(() =>
      getBlogPostAuthors({
        frontMatter: {
          authors: [{name: 'Sébastien Lorber'}],
          author: 'Yangshun Tay',
        },
        authorsMap: undefined,
        baseUrl: '/',
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      "To declare blog post authors, use the 'authors' front matter in priority.
      Don't mix 'authors' with other existing 'author_*' front matter. Choose one or the other, not both at the same time."
    `);

    expect(() =>
      getBlogPostAuthors({
        frontMatter: {
          authors: [{key: 'slorber'}],
          author_title: 'legacy title',
        },
        authorsMap: {slorber: {name: 'Sébastien Lorber'}},
        baseUrl: '/',
      }),
    ).toThrowErrorMatchingInlineSnapshot(`
      "To declare blog post authors, use the 'authors' front matter in priority.
      Don't mix 'authors' with other existing 'author_*' front matter. Choose one or the other, not both at the same time."
    `);
  });
});

describe('getAuthorsMap', () => {
  const fixturesDir = path.join(__dirname, '__fixtures__/authorsMapFiles');
  const contentPaths = {
    contentPathLocalized: fixturesDir,
    contentPath: fixturesDir,
  };

  it('getAuthorsMap can read yml file', async () => {
    await expect(
      getAuthorsMap({
        contentPaths,
        authorsMapPath: 'authors.yml',
      }),
    ).resolves.toBeDefined();
  });

  it('getAuthorsMap can read json file', async () => {
    await expect(
      getAuthorsMap({
        contentPaths,
        authorsMapPath: 'authors.json',
      }),
    ).resolves.toBeDefined();
  });

  it('getAuthorsMap can return undefined if yaml file not found', async () => {
    await expect(
      getAuthorsMap({
        contentPaths,
        authorsMapPath: 'authors_does_not_exist.yml',
      }),
    ).resolves.toBeUndefined();
  });

  describe('getAuthorsMap returns normalized', () => {
    it('socials', async () => {
      const authorsMap = await getAuthorsMap({
        contentPaths,
        authorsMapPath: 'authors.yml',
      });
      expect(authorsMap.slorber.socials).toMatchInlineSnapshot(`
        {
          "stackoverflow": "https://stackoverflow.com/users/82609",
          "twitter": "https://twitter.com/sebastienlorber",
          "x": "https://x.com/sebastienlorber",
        }
      `);
      expect(authorsMap.JMarcey.socials).toMatchInlineSnapshot(`
        {
          "stackoverflow": "https://stackoverflow.com/users/102705/Joel-Marcey",
          "twitter": "https://twitter.com/JoelMarcey",
          "x": "https://x.com/JoelMarcey",
        }
      `);
    });
  });
});

describe('validateAuthorsMap', () => {
  it('accept valid authors map', () => {
    const authorsMap: AuthorsMap = {
      slorber: {
        name: 'Sébastien Lorber',
        title: 'maintainer',
        url: 'https://sebastienlorber.com',
        imageURL: 'https://github.com/slorber.png',
      },
      yangshun: {
        name: 'Yangshun Tay',
        imageURL: 'https://github.com/yangshun.png',
        randomField: 42,
      },
      jmarcey: {
        name: 'Joel',
        title: 'creator of Docusaurus',
        hello: new Date(),
      },
    };
    expect(validateAuthorsMap(authorsMap)).toEqual(authorsMap);
  });

  it('rename snake case image_url to camelCase imageURL', () => {
    const authorsMap: AuthorsMap = {
      slorber: {
        name: 'Sébastien Lorber',
        image_url: 'https://github.com/slorber.png',
      },
    };
    expect(validateAuthorsMap(authorsMap)).toEqual({
      slorber: {
        name: 'Sébastien Lorber',
        imageURL: 'https://github.com/slorber.png',
      },
    });
  });

  it('accept author with only image', () => {
    const authorsMap: AuthorsMap = {
      slorber: {
        imageURL: 'https://github.com/slorber.png',
        url: 'https://github.com/slorber',
      },
    };
    expect(validateAuthorsMap(authorsMap)).toEqual(authorsMap);
  });

  it('reject author without name or image', () => {
    const authorsMap: AuthorsMap = {
      slorber: {
        title: 'foo',
      },
    };
    expect(() =>
      validateAuthorsMap(authorsMap),
    ).toThrowErrorMatchingInlineSnapshot(
      `""slorber" must contain at least one of [name, imageURL]"`,
    );
  });

  it('reject undefined author', () => {
    expect(() =>
      validateAuthorsMap({
        slorber: undefined,
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `""slorber" cannot be undefined. It should be an author object containing properties like name, title, and imageURL."`,
    );
  });

  it('reject null author', () => {
    expect(() =>
      validateAuthorsMap({
        slorber: null,
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `""slorber" should be an author object containing properties like name, title, and imageURL."`,
    );
  });

  it('reject array author', () => {
    expect(() =>
      validateAuthorsMap({slorber: []}),
    ).toThrowErrorMatchingInlineSnapshot(
      `""slorber" should be an author object containing properties like name, title, and imageURL."`,
    );
  });

  it('reject array content', () => {
    expect(() => validateAuthorsMap([])).toThrowErrorMatchingInlineSnapshot(
      `"The authors map file should contain an object where each entry contains an author key and the corresponding author's data."`,
    );
  });

  it('reject flat author', () => {
    expect(() =>
      validateAuthorsMap({name: 'Sébastien'}),
    ).toThrowErrorMatchingInlineSnapshot(
      `""name" should be an author object containing properties like name, title, and imageURL."`,
    );
  });

  it('reject non-map author', () => {
    const authorsMap: AuthorsMap = {
      // @ts-expect-error: for tests
      slorber: [],
    };
    expect(() =>
      validateAuthorsMap(authorsMap),
    ).toThrowErrorMatchingInlineSnapshot(
      `""slorber" should be an author object containing properties like name, title, and imageURL."`,
    );
  });
});

describe('authors socials', () => {
  it('valid known author map socials', () => {
    const authorsMap: AuthorsMap = {
      ozaki: {
        name: 'ozaki',
        socials: {
          twitter: 'ozakione',
          github: 'ozakione',
        },
      },
    };

    expect(validateAuthorsMap(authorsMap)).toEqual(authorsMap);
  });

  it('throw socials that are not strings', () => {
    const authorsMap: AuthorsMap = {
      ozaki: {
        name: 'ozaki',
        socials: {
          // @ts-expect-error: for tests
          twitter: 42,
        },
      },
    };

    expect(() =>
      validateAuthorsMap(authorsMap),
    ).toThrowErrorMatchingInlineSnapshot(
      `""ozaki.socials.twitter" must be a string"`,
    );
  });

  it('throw socials that are objects', () => {
    const authorsMap: AuthorsMap = {
      ozaki: {
        name: 'ozaki',
        socials: {
          // @ts-expect-error: for tests
          twitter: {link: 'ozakione'},
        },
      },
    };

    expect(() =>
      validateAuthorsMap(authorsMap),
    ).toThrowErrorMatchingInlineSnapshot(
      `""ozaki.socials.twitter" must be a string"`,
    );
  });

  it('valid unknown author map socials', () => {
    const authorsMap: AuthorsMap = {
      ozaki: {
        name: 'ozaki',
        socials: {
          random: 'ozakione',
        },
      },
    };

    expect(validateAuthorsMap(authorsMap)).toEqual(authorsMap);
  });
});
