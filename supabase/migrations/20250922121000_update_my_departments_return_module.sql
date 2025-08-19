-- Update my_departments to include module_id in the return set
CREATE OR REPLACE FUNCTION public.my_departments(p_company_id UUID DEFAULT NULL)
RETURNS TABLE(
  department_id UUID,
  company_id UUID,
  module_id UUID,
  name TEXT,
  slug TEXT,
  color TEXT,
  business_unit TEXT,
  is_active BOOLEAN,
  role_in_department TEXT,
  is_primary BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT d.id, d.company_id, d.module_id, d.name, d.slug, d.color, d.business_unit, d.is_active, ud.role_in_department, ud.is_primary
  FROM public.user_departments ud
  JOIN public.departments d ON d.id = ud.department_id
  WHERE ud.user_id = auth.uid()
    AND (p_company_id IS NULL OR d.company_id = p_company_id)
    AND public.user_can_access_empresa(d.company_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

