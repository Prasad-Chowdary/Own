
const createPostTypes = (PostType) => {
    const createPostTypes = (postTypeNames) => {
        postTypes = [];
        var count = 0;
        for (var i = 0; i < postTypeNames.length; i++) {
            PostType.create({id: count, name: postTypeNames[i]}).then(pstType => {
                postTypes.push(pstType);
            }).catch(err => {
                console.log(err);
                return null;
            });
            count++;
        };
        return postTypes;
    }

    return createPostTypes;
}

module.exports = createPostTypes;

