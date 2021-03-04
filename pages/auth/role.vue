<template>
  <div class="container">
    <page-top>
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
        <el-breadcrumb-item to="/auth/account">权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>
          <span class="isactive">角色管理</span>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </page-top>

    <!-- 筛选模块 -->
    <div v-if="$auth.check('/auth/role/edit')" class="dashboard-card">
      <div class="filterform">
        <div class="filterform__top">
          <div class="filterform__topright">
            <el-button
              type="primary"
              size="small"
              icon="el-icon-plus"
              @click="edit()"
            >
              新增角色
            </el-button>
          </div>
        </div>
      </div>
    </div>
    <!-- 数据展示模块 -->
    <div v-loading="onLoading" class="dashboard-card">
      <div class="tableblock__total">
        共<span>{{ tableData.length }}</span
        >个角色
      </div>
      <el-table class="tableblock__table" stripe :data="tableData">
        <el-table-column
          prop="name"
          label="角色名称"
          min-width="120"
          align="center"
        />
        <el-table-column
          prop="remarks"
          label="角色描述"
          min-width="150"
          align="center"
          show-overflow-tooltip
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
        <el-table-column fixed="right" label="操作" width="100" align="center">
          <template slot-scope="scope">
            <template v-if="!scope.row.id === 1">
              <el-button
                v-if="$auth.check('/auth/role/edit')"
                type="text"
                @click="edit(scope.row.id)"
              >
                编辑
              </el-button>
              <el-button
                v-if="$auth.check('/auth/role/del')"
                type="text"
                @click="del(scope.row.id)"
              >
                删除
              </el-button>
            </template>
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

    <!-- 新增/编辑角色 -->
    <el-dialog
      class="dialog"
      title="角色"
      :visible.sync="onEdit"
      width="450px"
      @opened="onEditOpened"
    >
      <div class="steps">
        <el-steps :active="step" finish-status="success" simple>
          <el-step title="角色信息" />
          <el-step title="角色权限" />
        </el-steps>
      </div>
      <div v-show="step === 0">
        <el-form
          ref="editForm"
          :model="editForm"
          :rules="editFormRules"
          size="small"
          label-width="80px"
        >
          <el-form-item prop="name" label="角色名称">
            <el-input v-model="editForm.name" placeholder="角色名称" />
          </el-form-item>
          <el-form-item prop="remarks" label="角色描述">
            <el-input v-model="editForm.remarks" placeholder="角色描述" />
          </el-form-item>
        </el-form>
      </div>
      <div v-show="step === 1">
        <el-tree
          ref="menuTree"
          :data="menuTree"
          :props="{
            label: 'name',
          }"
          node-key="id"
          show-checkbox
        />
      </div>
      <div slot="footer" style="text-align: center">
        <el-button
          v-if="step === 0"
          size="small"
          type="primary"
          @click="nextStep"
        >
          下一步
        </el-button>
        <el-button
          v-if="step === 1"
          size="small"
          type="primary"
          @click="step = 0"
        >
          上一步
        </el-button>
        <el-button
          v-if="step === 1"
          size="small"
          type="primary"
          @click="submit"
        >
          提交
        </el-button>
        <el-button size="small" @click="onEdit = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      onLoading: false,
      filterForm: {},
      tableData: [],
      total: 0,
      prePage: 20,
      currentPage: 0,

      // 新增/编辑角色
      menuTree: [],
      departmentTree: [],
      onEdit: false,
      editForm: {
        name: '',
        remarks: '',
        menuIds: [],
      },
      step: 0,
      activeName: 'first',
      editFormRules: {
        name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
        remarks: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
        ],
      },
    }
  },
  created() {
    this.getMenuTree()
    this.getData()
  },
  methods: {
    /**
     * 获取菜单树形结构
     */
    getMenuTree() {
      this.$http.api({
        url: '/common/menuTree',
        success: (res) => {
          this.menuTree = res.data
        },
      })
    },
    /**
     * 获取列表数据
     * @param {Number} page 页码
     */
    getData(page = 1) {
      this.onLoading = true
      this.$http.api({
        url: '/auth/role',
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
     * 编辑列表项
     * @param {Number} id 数据项ID
     */
    edit(id = null) {
      if (id) {
        this.$http.api({
          url: 'auth/roleInfo',
          params: { id },
          loading: true,
          success: (res) => {
            this.editForm = {
              id,
              name: res.data.name,
              remarks: res.data.remarks,
              menuIds: res.data.menu_ids,
            }
            this.onEdit = true
            this.step = 0
          },
        })
      } else {
        this.editForm = {
          name: '',
          remarks: '',
          menuIds: [],
        }
        this.onEdit = true
        this.step = 0
      }
    },
    onEditOpened() {
      this.$refs.menuTree.setCheckedKeys(this.editForm.menuIds)
      this.$refs.editForm.clearValidate()
    },
    nextStep() {
      this.$refs.editForm.validate((valid, field) => {
        if (valid) {
          this.step = 1
        } else {
          return false
        }
      })
    },
    /**
     * 提交
     */
    submit() {
      const menuIds = this.$refs.menuTree.getCheckedKeys()
      menuIds.push(...this.$refs.menuTree.getHalfCheckedKeys())
      const params = {
        name: this.editForm.name,
        remarks: this.editForm.remarks,
        menuIds,
      }

      if (this.editForm.id) {
        params.id = this.editForm.id
      }

      this.$http.api({
        url: 'auth/roleEdit',
        params,
        loading: true,
        method: 'post',
        success: (res) => {
          this.$message.success(`${params.id ? '修改' : '新增'}成功`)
          this.getData()
          this.onEdit = false
        },
      })
    },
    /**
     * 删除指定列表数据
     * @param {Number} id 需要删除的列表项的ID
     */
    del(id) {
      this.$confirm('此操作将删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.$http.api({
            url: '/auth/roleDel',
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
  },
}
</script>

<style scoped>
.container {
}

.steps {
  margin-bottom: 20px;
}

.steps >>> .el-step__title {
  font-size: 14px;
}
</style>
