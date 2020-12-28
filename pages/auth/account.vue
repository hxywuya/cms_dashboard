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
              type="primary"
              size="small"
              icon="el-icon-plus"
              @click="edit()"
            >
              新增用户
            </el-button>
          </div>
        </div>
        <div class="filterform__actions">
          <div class="filterform__actionslabel">批量操作</div>
          <el-button
            style="height: 32px"
            type="primary"
            size="small"
            @click="setStatusOnMany(1)"
          >
            批量启用
          </el-button>
          <el-button
            style="height: 32px"
            type="primary"
            size="small"
            @click="setStatusOnMany(0)"
          >
            批量禁用
          </el-button>
        </div>
      </div>
    </div>
    <!-- 数据展示模块 -->
    <div v-loading="onLoading" class="dashboard-card">
      <div class="tableblock__total">
        共<span>{{ total }}</span
        >个系统账号
      </div>
      <el-table
        class="tableblock__table"
        stripe
        :data="tableData"
        :header-cell-style="{ 'text-align': 'center' }"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
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
          label="所属角色"
          min-width="120"
          align="center"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            {{ scope.row.roleInfo ? scope.row.roleInfo.rolename : '' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="140">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.status"
              :disabled="scope.row.id === 1"
              :active-value="1"
              active-text="启用"
              :inactive-value="0"
              inactive-text="禁用"
              @change="setStatus(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="remark"
          label="备注"
          min-width="100"
          show-overflow-tooltip
          align="center"
        >
          <template slot-scope="scope">
            {{ scope.row.remark ? scope.row.remark : '无' }}
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
              v-if="scope.row.id != 1"
              type="text"
              @click="edit(scope.row.id)"
            >
              编辑
            </el-button>
            <el-button
              v-if="scope.row.id != 1"
              type="text"
              @click="del(scope.row.id)"
            >
              删除
            </el-button>
            <el-button type="text" @click="rePassword(scope.row.id)">
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
    <el-dialog title="账户" :visible.sync="onEdit" width="450px">
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
        <el-form-item prop="staffId" label="关联员工：">
          <div>
            <el-button type="text" @click="toChoiceStaff">
              {{ editForm.staff ? '重新选择' : '选择' }}
            </el-button>
          </div>
          <div v-if="editForm.staff" class="staff">
            <el-avatar
              class="staff__avatar"
              :src="
                editForm.staff.avatar
                  ? editForm.staff.avatar
                  : editForm.staff.thumbAvatar
                  ? editForm.staff.thumbAvatar
                  : '/img/default_avatar.png'
              "
            />
            <div class="staff__name">
              {{ editForm.staff.name }}
            </div>
            <div class="staff__company ellipsis">
              {{ editForm.staff.departmentInfo.name }}
            </div>
          </div>
        </el-form-item>
        <el-form-item prop="role" label="所属角色：">
          <el-select
            v-model="editForm.role"
            placeholder="请选择"
            style="width: 200px"
          >
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.rolename"
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
        <el-form-item prop="remask" label="备注：">
          <el-input
            v-model="editForm.remask"
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
    <el-dialog title="重置密码" :visible.sync="onRePassword" width="450px">
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

    <!-- 选择员工 -->
    <el-dialog
      title="选择员工"
      :visible.sync="onChoiceStaff"
      width="600px"
      @close="cancelBind"
    >
      <div class="heiscoll">
        <div class="over">
          <div class="fl" style="width: 40%">
            <div>选择部门</div>
            <div class="mt10 eltree" style="margin-right: 10px">
              <el-tree
                :data="departmentAllTree"
                :props="{
                  label: 'name',
                  value: 'id',
                }"
                node-key="id"
                :current-node-key="null"
                default-expand-all
                :expand-on-click-node="false"
                highlight-current
                @node-click="onSelectDepartment"
              />
            </div>
          </div>
          <div class="fl" style="width: 60%">
            <div>人员姓名</div>
            <div>
              <el-input
                v-model="staffFilterForm.search"
                placeholder="请输入员工姓名"
                @keypress.enter.native="getStaffList()"
              >
                <el-button
                  slot="append"
                  icon="el-icon-search"
                  @click="getStaffList()"
                >
                </el-button>
              </el-input>
            </div>
            <div style="margin-top: 10px">
              <el-radio-group
                v-if="staffList.length > 0"
                v-model="staffFilterForm.staffId"
              >
                <div
                  v-for="item in staffList"
                  :key="item.id"
                  style="height: 20px"
                >
                  <el-radio :label="item.id">
                    {{
                      item.mobile ? `${item.name} / ${item.mobile}` : item.name
                    }}
                  </el-radio>
                </div>
              </el-radio-group>
              <span v-else>未搜到该员工</span>
            </div>
            <div>
              <el-pagination
                class="tableblock__pagination"
                layout="prev, pager, next"
                :total="staffTotal"
                :page-size.sync="staffPrePage"
                :current-page="staffCurrentPage"
                @current-change="getStaffList"
              />
            </div>
          </div>
        </div>
      </div>
      <span slot="footer">
        <el-button size="small" @click="cancelBind">取 消</el-button>
        <el-button type="primary" size="small" @click="onConfirmSelect">
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
      selectedIds: [], // 选中列表项的ID集合

      // 编辑数据
      onEdit: false,
      editForm: {
        account: '',
        password: '',
        role: '',
        status: 1,
        remask: '',
        staff: null,
        staffId: null,
      },
      departmentTree: [],
      roleList: [],
      editFormRules: {
        account: [{ required: true, message: '请输入账户名', trigger: 'blur' }],
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
        ],
        staffId: [
          { required: true, message: '请选择关联员工', trigger: 'change' },
        ],
        role: [{ required: true, message: '请选择角色', trigger: 'change' }],
        status: [
          { required: true, message: '请选择账户状态', trigger: 'blur' },
        ],
      },

      // 选择员工
      onChoiceStaff: false,
      departmentAllTree: [],
      staffList: [],
      staffCurrentPage: 0,
      staffPrePage: 20,
      staffTotal: 0,
      staffFilterForm: {
        search: '',
        departmentId: null,
        staffId: null,
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
        url: '/role/getRoles',
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
     * 监听数据表项选中状态
     * @param {Array} val 当前选中的列
     */
    handleSelectionChange(val) {
      const selectedIds = []
      for (const data of val) {
        selectedIds.push(data.id)
      }
      this.selectedIds = selectedIds
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
          url: '/systemAccount/getSystemAccount',
          params: { id },
          loading: true,
          success: (res) => {
            this.editForm = {
              id,
              account: res.data.useraccount,
              password: '',
              role: res.data.role,
              status: res.data.usingstatus,
              remask: res.data.remark,
              staff: res.data.employeeInfo,
              staffId: res.data.employeeid,
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
          role: '',
          status: 1,
          remask: '',
          staff: null,
          staffId: null,
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
            useraccount: this.editForm.account,
            role: this.editForm.role,
            usingStatus: this.editForm.status,
            remark: this.editForm.remark,
            employeeid: this.editForm.staffId,
          }

          let url = '/systemAccount/createSystemAccount'
          if (this.editForm.id) {
            params.id = this.editForm.id
            url = '/systemAccount/updateSystemAccount'
          } else {
            params.password = this.editForm.password
          }

          this.$http.api({
            url,
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
     * 前往选择员工
     */
    toChoiceStaff() {
      this.staffFilterForm = {
        search: '',
        departmentId: null,
        staffId: null,
      }
      this.onChoiceStaff = true
    },
    /**
     * 部门树选中
     * @param {Number} id 数据ID
     */
    onSelectDepartment(data, node, nodes) {
      this.staffFilterForm.departmentId = data.id
      this.getStaffList()
    },
    /**
     * 确认选中员工
     */
    onConfirmSelect() {
      if (!this.staffFilterForm.staffId) {
        this.$message.warning('请先选择一名员工')
        return
      }
      for (const staff of this.staffList) {
        if (staff.id === this.staffFilterForm.staffId) {
          this.editForm.staff = staff
          this.editForm.staffId = staff.id
          this.$refs.editForm.validateField('staffId')
          break
        }
      }

      this.onChoiceStaff = false
    },
    /**
     * 设定指定列表数据的状态
     * @param {Object} data 需要删除的列表项的数据
     */
    setStatus(data) {
      this.$confirm(
        `此操作将${data.usingstatus === 0 ? '禁用' : '启用'}该账户, 是否继续?`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(() => {
          const params = {
            ids: data.id,
            usingStatus: data.usingstatus,
          }

          this.$http.api({
            url: '/systemAccount/setUsingStatusById',
            params,
            loading: true,
            method: 'post',
            type: 'form',
            success: (res) => {
              this.$message.success(
                `账户${data.usingstatus === 0 ? '停用' : '启用'}成功`
              )
            },
          })
        })
        .catch(() => {
          data.usingstatus = data.usingstatus === 0 ? 1 : 0
        })
    },
    /**
     * 设定选中的所有列表数据的状态
     * @param {Number} status 状态 0：禁用 1：启用
     */
    setStatusOnMany(status = 0) {
      if (this.selectedIds.length <= 0) {
        this.$message.warning('未选中任何账户')
        return
      }
      this.$confirm(
        `此操作将${status === 0 ? '禁用' : '启用'}所选账户, 是否继续?`,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )
        .then(() => {
          const params = {
            ids: this.selectedIds.join(','),
            usingStatus: status,
          }

          this.$http.api({
            url: '/systemAccount/setUsingStatusById',
            params,
            loading: true,
            method: 'post',
            type: 'form',
            success: (res) => {
              this.$message.success(`账户${status === 0 ? '禁用' : '启用'}成功`)
              this.getData()
              this.onEdit = false
            },
          })
        })
        .catch(() => {})
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
            url: '/systemAccount/deleteSystemAccount',
            params: { id },
            loading: true,
            method: 'post',
            type: 'form',
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
    cancelBind() {
      this.onChoiceStaff = false
      this.staffFilterForm.search = ''
      this.getStaffList()
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
        url: '/systemAccount/modifyPadword',
        params,
        loading: true,
        method: 'post',
        type: 'form',
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
.staff {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  width: 100px;
  height: 100px;
  margin-top: 15px;
  position: relative;
  overflow: hidden;
}

.staff__avatar {
  width: 58px;
  height: 58px;
  margin-bottom: 4px;
}

.staff__name {
  font-size: 14px;
  font-weight: bold;
  color: rgba(51, 51, 51, 1);
  line-height: 20px;
}

.staff__company {
  width: 100%;
  font-size: 12px;
  color: rgba(153, 153, 153, 1);
  line-height: 17px;
}
</style>
