module.exports = {
    port: 8424,
    resources: {
        'a-admin-events': {
            path: "C:/TheATeam/txData/qbcore.base/resources/[a]/a-admin-events",
            txAdminRefresh: true,
            txAdminEnsure: true,
        },
        'a-megaphones': {
            path: "C:/TheATeam/txData/qbcore.base/resources/[a]/a-megaphones",
            txAdminRefresh: true,
            txAdminEnsure: true,
        },
        'autopull': {
            path: "C:/TheATeam/AutoPull",
            txAdminRefresh: false,
            txAdminEnsure: false,
        },
    }
}
