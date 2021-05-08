<template>
  <div class="container">
    <page-top>
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>CRM</el-breadcrumb-item>
        <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
        <el-breadcrumb-item to="/setting/base/bind">
          系统设置
        </el-breadcrumb-item>
        <el-breadcrumb-item to="/setting/auth/account">
          权限管理
        </el-breadcrumb-item>
        <el-breadcrumb-item>
          <span class="isactive">系统账号管理</span>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </page-top>

    <!-- 筛选模块 -->
    <div class="dashboard-card">
      <div class="filterform">
        <div class="filterform__top">
          <el-input
            v-model="filterForm.search"
            class="filterform__search"
            size="small"
            placeholder="输入文章标题搜索"
            @keypress.enter.native="getData()"
          >
            <el-button slot="append" icon="el-icon-search" @click="getData()" />
          </el-input>
          <div class="filterform__topright">
            <el-button
              v-if="$auth.check('/auth/account/edit')"
              type="primary"
              size="small"
              icon="el-icon-plus"
              @click="edit()"
            >
              新建文章
            </el-button>
          </div>
        </div>
      </div>
    </div>
    <!-- 数据展示模块 -->
    <div v-loading="onLoading" class="dashboard-card">
      <div class="tableblock__total">
        共<span>{{ total }}</span
        >篇文章
      </div>
      <el-table class="tableblock__table" stripe :data="tableData">
        <el-table-column
          prop="account"
          label="账户名"
          min-width="120"
          align="center"
        />
        <el-table-column
          prop="name"
          label="所有人"
          min-width="80"
          align="center"
        />
        <el-table-column
          prop="mobile"
          label="手机号"
          min-width="120"
          align="center"
        />
        <el-table-column
          prop="role"
          label="角色"
          min-width="120"
          align="center"
        >
          <div slot-scope="scope" class="role-list">
            <el-tag v-for="role of scope.row.roles" :key="role.id" size="mini">
              {{ role.name }}
            </el-tag>
          </div>
        </el-table-column>
        <el-table-column label="状态" min-width="140" align="center">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.status"
              :disabled="
                scope.row.id === 1 || !$auth.check('/auth/account/setStatus')
              "
              :active-value="1"
              active-text="启用"
              :inactive-value="0"
              inactive-text="禁用"
              @change="setStatus(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="remarks"
          label="备注"
          min-width="100"
          show-overflow-tooltip
          align="center"
        >
          <template slot-scope="scope">
            {{ scope.row.remarks ? scope.row.remarks : '无' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="create_time"
          label="创建时间"
          min-width="150"
          align="center"
        />
        <el-table-column fixed="right" label="操作" width="180" align="center">
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.id != 1 && $auth.check('/auth/account/edit')"
              type="text"
              @click="edit(scope.row.id)"
            >
              编辑
            </el-button>
            <el-button
              v-if="scope.row.id != 1 && $auth.check('/auth/account/del')"
              type="text"
              @click="del(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="tableblock__pagination"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :page-size.sync="prePage"
        :current-page="currentPage"
        @current-change="getData"
        @size-change="getData()"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  data() {
    return {
      onLoading: false,
      filterForm: {
        search: '',
      },
      tableData: [],
      total: 0,
      prePage: 20,
      currentPage: 0,

      // 编辑数据
      onEdit: false,
      editForm: {
        account: '',
        password: '',
        name: '',
        mobile: '',
        roles: [],
        status: 1,
        remarks: '',
      },
      departmentTree: [],
      roleList: [],
      editFormRules: {
        account: [{ required: true, message: '请输入账户名', trigger: 'blur' }],
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
        ],
        roles: [{ required: true, message: '请选择角色', trigger: 'blur' }],
        status: [
          { required: true, message: '请选择账户状态', trigger: 'blur' },
        ],
      },

      // 重置密码
      onRePassword: false,
      rePasswordForm: {
        id: null,
        password: '',
      },
    }
  },
  computed: {
    // 将store.state中的属性映射到computed
    ...mapState(['userInfo']),
  },
  created() {
    this.getData()
    this.getRoleList()
  },
  methods: {
    /**
     * 获取角色数据
     */
    getRoleList() {
      this.$http.api({
        url: '/common/allRoles',
        success: (res) => {
          this.roleList = res.data
        },
      })
    },
    /**
     * 重置筛选表单
     */
    clearFilterForm() {
      this.filterForm = {
        search: '',
      }
      this.getData()
    },
    /**
     * 获取列表数据
     * @param {Number} page 页码
     */
    getData(page = 1) {
      const params = {
        page,
        num: this.prePage,
        search: this.filterForm.search,
      }

      if (this.filterForm.search) {
        params.search = this.filterForm.search
      }

      this.onLoading = true
      this.$http.api({
        url: '/article/list',
        params,
        success: (res) => {
          this.tableData = res.data.data
          this.currentPage = res.data.current_page
          this.prePage = res.data.per_page
          this.total = res.data.total
        },
        complete: (res) => {
          this.onLoading = false
        },
      })
    },
    /**
     * 编辑指定列表数据
     * @param {Number} id 数据ID
     */
    edit(id = null) {
      if (id) {
        this.$router.push('/article/edit')
      } else {
        this.$router.push('/article/edit')
      }
    },
  },
}
</script>

<style scoped>
.container {
}

/* 选择的员工 */
.role-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.role-list .el-tag + .el-tag {
  margin-top: 4px;
}
</style>
