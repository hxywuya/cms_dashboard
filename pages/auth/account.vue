<template>
  <div class="container">
    <pagetop label="企业微信绑定">
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
    </pagetop>

    <!-- 筛选模块 -->
    <div class="dashboard-card">
      <div class="filterform">
        <div class="filterform__top">
          <el-input
            v-model="filterForm.search"
            class="filterform__search"
            size="small"
            placeholder="输入角色/账号/姓名/手机号搜索"
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
              新增用户
            </el-button>
          </div>
        </div>
      </div>
    </div>
    <!-- 数据展示模块 -->
    <div v-loading="onLoading" class="dashboard-card">
      <div class="tableblock__total">
        共<span>{{ total }}</span
        >个系统账号
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
            <el-button
              v-if="$auth.check('/auth/account/rePwd')"
              type="text"
              @click="rePassword(scope.row.id)"
            >
              重置密码
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

    <!-- 新增编辑账户 -->
    <el-dialog class="dialog" title="账户" :visible.sync="onEdit" width="450px">
      <el-form
        ref="editForm"
        :rules="editFormRules"
        :model="editForm"
        size="small"
        label-width="100px"
      >
        <el-form-item prop="account" label="账户名：">
          <el-input v-model="editForm.account" placeholder="请输入登录用户名" />
        </el-form-item>
        <el-form-item v-if="!editForm.id" prop="password" label="登录密码：">
          <el-input
            v-model="editForm.password"
            type="password"
            placeholder="请输入登录密码"
          />
        </el-form-item>
        <el-form-item prop="name" label="姓名：">
          <el-input v-model="editForm.name" placeholder="请输入账户姓名" />
        </el-form-item>
        <el-form-item prop="mobile" label="手机号：">
          <el-input v-model="editForm.mobile" placeholder="请输入账户手机号" />
        </el-form-item>
        <el-form-item prop="roles" label="账户角色：">
          <el-select v-model="editForm.roles" multiple placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="status" label="账户状态：">
          <el-switch
            v-model="editForm.status"
            :active-value="1"
            active-text="启用"
            :inactive-value="0"
            inactive-text="禁用"
          />
        </el-form-item>
        <el-form-item prop="remarks" label="备注：">
          <el-input
            v-model="editForm.remarks"
            type="textarea"
            :rows="3"
            placeholder="请输入内容"
          >
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="small" @click="onEdit = false">取 消</el-button>
        <el-button type="primary" size="small" @click="submit">
          确 定
        </el-button>
      </span>
    </el-dialog>

    <!-- 重置密码 -->
    <el-dialog
      class="dialog"
      title="重置密码"
      :visible.sync="onRePassword"
      width="450px"
    >
      <el-form :model="rePasswordForm" size="small" label-width="100px">
        <el-form-item label="设置新密码">
          <el-input
            v-model="rePasswordForm.password"
            type="password"
            placeholder="新密码"
          />
          <div>请记住新密码并将密码告诉用户。</div>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button size="small" @click="onRePassword = false">取 消</el-button>
        <el-button type="primary" size="small" @click="doRePassword">
          确 定
        </el-button>
      </span>
    </el-dialog>
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
        url: 'auth/account',
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
        this.$http.api({
          url: '/auth/accountInfo',
          params: { id },
          loading: true,
          success: (res) => {
            this.editForm = {
              id,
              account: res.data.account,
              password: '',
              name: res.data.name,
              mobile: res.data.mobile,
              roles: res.data.roles,
              status: res.data.status,
              remarks: res.data.remarks,
            }

            if (this.$refs.editForm) {
              this.$refs.editForm.clearValidate()
            }

            this.onEdit = true
          },
        })
      } else {
        this.editForm = {
          account: '',
          password: '',
          name: '',
          mobile: '',
          roles: [],
          status: 1,
          remarks: '',
        }

        if (this.$refs.editForm) {
          this.$refs.editForm.clearValidate()
        }

        this.onEdit = true
      }
    },
    /**
     * 提交新增/编辑表单
     */
    submit() {
      this.$refs.editForm.validate((valid, list) => {
        if (valid) {
          const params = {
            account: this.editForm.account,
            name: this.editForm.name,
            mobile: this.editForm.mobile,
            roles: this.editForm.roles,
            status: this.editForm.status,
            remarks: this.editForm.remarks,
          }

          if (this.editForm.id) {
            params.id = this.editForm.id
          } else {
            params.password = this.editForm.password
          }

          this.$http.api({
            url: '/auth/accountEdit',
            params,
            loading: true,
            method: 'post',
            success: (res) => {
              this.$message.success(`${params.id ? '修改' : '新增'}成功`)
              this.getData()
              this.onEdit = false
            },
          })
        }
      })
    },
    /**
     * 设定指定列表数据的状态
     * @param {Object} data 需要删除的列表项的数据
     */
    setStatus(data) {
      this.$confirm(
        `此操作将${data.status === 0 ? '禁用' : '启用'}该账户, 是否继续?`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(() => {
          const params = {
            id: data.id,
            status: data.status,
          }

          this.$http.api({
            url: '/auth/accountStatus',
            params,
            loading: true,
            method: 'post',
            success: (res) => {
              this.$message.success(
                `账户${data.status === 0 ? '停用' : '启用'}成功`
              )
            },
          })
        })
        .catch(() => {
          data.status = data.status === 0 ? 1 : 0
        })
    },
    /**
     * 删除指定列表数据
     * @param {Number} id 需要删除的列表项的ID
     */
    del(id) {
      this.$confirm('此操作将删除该账户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.$http.api({
            url: '/auth/accountDel',
            params: { id },
            loading: true,
            method: 'post',
            success: (res) => {
              this.$message.success('删除成功')
              this.getData()
            },
          })
        })
        .catch(() => {})
    },
    /**
     * 重置指定账户的密码
     * @param {Number} id 指定账户的ID
     */
    rePassword(id) {
      this.rePasswordForm = {
        id,
        password: '',
      }

      this.onRePassword = true
    },
    /**
     * 对密码进行重置
     */
    doRePassword() {
      const params = {
        id: this.rePasswordForm.id,
        password: this.rePasswordForm.password,
      }

      this.$http.api({
        url: '/auth/resetAccountPwd',
        params,
        loading: true,
        method: 'post',
        success: (res) => {
          this.$message.success('密码重置成功')
          if (this.userInfo.id === params.id) {
            this.$cookies.removeAll()
            this.$router.push('/login')
          }
          this.onRePassword = false
        },
      })
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
